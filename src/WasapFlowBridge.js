'use strict';

const axios     = require('axios');
const Messages  = require('./Messages');
const Clients   = require('./Clients');
const Contacts  = require('./Contacts');
const Webhooks  = require('./Webhooks');
const Templates = require('./Templates');
const Broadcasts = require('./Broadcasts');
const Analytics = require('./Analytics');
const Profile   = require('./Profile');

class WasapFlowBridge {
    /**
     * @param {object} config
     * @param {string} config.partnerKey    - Partner API key (wf_live_xxx)
     * @param {string} config.webhookSecret - Webhook secret (whsec_xxx)
     * @param {string} [config.baseUrl]     - Bridge server URL (default: https://api.wasapflow.com)
     * @param {number} [config.timeout]     - Request timeout in ms (default: 15000)
     */
    constructor({ partnerKey, webhookSecret, baseUrl = 'https://api.wasapflow.com', timeout = 15000 } = {}) {
        if (!partnerKey) throw new Error('[WasapFlow] partnerKey is required');

        this._partnerKey    = partnerKey;
        this._webhookSecret = webhookSecret || '';
        this._baseUrl       = baseUrl.replace(/\/$/, '');
        this._timeout       = timeout;

        this._http = axios.create({
            baseURL: `${this._baseUrl}/bridge/v1`,
            timeout: this._timeout,
            headers: {
                'x-partner-key':  this._partnerKey,
                'Content-Type':   'application/json'
            }
        });

        // Normalize API errors
        this._http.interceptors.response.use(
            res => {
                if (res.data && res.data.success === false) {
                    const err = new Error(res.data.error?.message || 'Bridge API error');
                    err.code        = res.data.error?.code || 'BRIDGE_ERROR';
                    err.bridgeError = res.data.error;
                    throw err;
                }
                return res.data;
            },
            err => {
                if (err.response?.data?.error) {
                    const apiErr = new Error(err.response.data.error.message || 'Bridge API error');
                    apiErr.code        = err.response.data.error.code || 'BRIDGE_ERROR';
                    apiErr.httpStatus  = err.response.status;
                    apiErr.bridgeError = err.response.data.error;
                    if (apiErr.code === 'RATE_LIMIT_EXCEEDED') {
                        apiErr.retryAfterMs = err.response.data.error.retry_after_ms || 1000;
                    }
                    throw apiErr;
                }
                err.code = 'NETWORK_ERROR';
                throw err;
            }
        );

        // Top-level resources
        this.clients    = new Clients(this._http);
        this.contacts   = new Contacts(this._http);
        this.webhooks   = new Webhooks(this._webhookSecret);
        this.templates  = new Templates(this._http);
        this.broadcasts = new Broadcasts(this._http);
        this.analytics  = new Analytics(this._http);
        this.profile    = new Profile(this._http);
    }

    /**
     * Get a per-WABA scoped client (messages, templates, broadcasts, analytics, profile).
     * @param {string} wabaId
     * @returns {ClientScope}
     */
    client(wabaId) {
        return new ClientScope(this._http, wabaId);
    }
}

class ClientScope {
    constructor(http, wabaId) {
        this._wabaId    = wabaId;
        this.messages   = new Messages(http, wabaId);
        this.templates  = new ScopedTemplates(http, wabaId);
        this.broadcasts = new ScopedBroadcasts(http, wabaId);
        this.analytics  = new ScopedAnalytics(http, wabaId);
        this.profile    = new ScopedProfile(http, wabaId);
    }
}

// Thin WABA-scoped wrappers so clients don't need to pass wabaId manually
class ScopedTemplates {
    constructor(http, wabaId) { this._t = new Templates(http); this._w = wabaId; }
    list()                    { return this._t.list(this._w); }
    create(opts)              { return this._t.create(this._w, opts); }
    delete(name)              { return this._t.delete(this._w, name); }
}

class ScopedBroadcasts {
    constructor(http, wabaId) { this._b = new Broadcasts(http); this._w = wabaId; }
    create(opts)              { return this._b.create(this._w, opts); }
    list(opts)                { return this._b.list(opts); }
    get(id)                   { return this._b.get(id); }
    cancel(id)                { return this._b.cancel(id); }
}

class ScopedAnalytics {
    constructor(http, wabaId) { this._a = new Analytics(http); this._w = wabaId; }
    get(opts)                 { return this._a.get(this._w, opts); }
}

class ScopedProfile {
    constructor(http, wabaId) { this._p = new Profile(http); this._w = wabaId; }
    get()                     { return this._p.get(this._w); }
    update(opts)              { return this._p.update(this._w, opts); }
}

module.exports = { WasapFlowBridge };
