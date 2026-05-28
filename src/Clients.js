'use strict';

class Clients {
    constructor(http) {
        this._http = http;
    }

    /**
     * Register a WABA after Embedded Signup.
     * @param {object} opts
     * @param {string} opts.wabaId       - WABA ID from Meta
     * @param {string} opts.phoneNumberId - Phone Number ID from Meta
     * @param {string} opts.accessToken  - User access token from Embedded Signup
     * @param {string} [opts.displayName] - Friendly name for this client
     */
    async register({ wabaId, phoneNumberId, accessToken, displayName } = {}) {
        return this._http.post('/clients/register', {
            waba_id: wabaId,
            phone_number_id: phoneNumberId,
            access_token: accessToken,
            display_name: displayName || ''
        });
    }

    /**
     * Register a WABA using an Embedded Signup code.
     * The platform exchanges the code server-side — your app never sees the Meta access token.
     * @param {object} opts
     * @param {string} opts.code         - OAuth code from FB.login authResponse
     * @param {string} [opts.displayName] - Friendly name for this client
     * @param {string} [opts.connectionMode] - "coexistence" for WhatsApp Business App onboarding
     */
    async registerFromCode({ code, displayName, connectionMode = 'coexistence' } = {}) {
        return this._http.post('/clients/register-from-code', {
            code,
            display_name: displayName || '',
            connection_mode: connectionMode
        });
    }

    /**
     * Get Embedded Signup config (Meta App ID and Config ID) for your frontend.
     */
    async getEmbeddedSignupConfig() {
        return this._http.get('/embedded-signup/config');
    }

    /**
     * Open WasapFlow hosted Embedded Signup popup.
     * FB.init runs on officialapi.wasapflow.com — Meta only sees WasapFlow.
     * Your client stays on your platform. No domain whitelist needed.
     *
     * @param {object} [opts]
     * @param {string} [opts.displayName] - Display name for the client WABA
     * @param {string} [opts.baseUrl]     - Override WasapFlow base URL
     * @returns {Promise<{waba_id, phone_number_id, display_name, quality_rating}>}
     */
    openEmbeddedSignup({ displayName = '', baseUrl } = {}) {
        const base = (baseUrl || this._http._baseUrl || 'https://officialapi.wasapflow.com').replace(/\/$/, '');
        const key  = this._http._partnerKey;
        const url  = `${base}/bridge/connect?partner_key=${encodeURIComponent(key)}&display_name=${encodeURIComponent(displayName)}`;

        return new Promise((resolve, reject) => {
            const popup = window.open(url, 'wasapflow_connect', 'width=480,height=600,left=200,top=100');
            if (!popup) return reject(new Error('Popup blocked. Please allow popups and try again.'));

            const handler = (event) => {
                if (event.data?.type === 'WASAPFLOW_CONNECT_SUCCESS') {
                    window.removeEventListener('message', handler);
                    resolve(event.data);
                }
            };
            window.addEventListener('message', handler);

            const checkClosed = setInterval(() => {
                if (popup.closed) {
                    clearInterval(checkClosed);
                    window.removeEventListener('message', handler);
                    reject(new Error('Popup closed without completing signup'));
                }
            }, 500);
        });
    }

    /**
     * List all registered WABAs for this partner.
     */
    async list() {
        return this._http.get('/clients');
    }

    /**
     * Remove a WABA from this partner account.
     * @param {string} wabaId
     */
    async remove(wabaId) {
        return this._http.delete(`/clients/${wabaId}`);
    }

    /**
     * Refresh quality rating and tier for a WABA from Meta.
     * Optionally update the stored access token.
     * @param {string} wabaId
     * @param {object} [opts]
     * @param {string} [opts.accessToken] - New access token to store (optional)
     */
    async refresh(wabaId, { accessToken } = {}) {
        const body = accessToken ? { access_token: accessToken } : {};
        return this._http.post(`/clients/${wabaId}/refresh`, body);
    }

    /**
     * Reconnect Meta webhook for a WABA.
     * Call this if a client's webhook events (messages, delivery receipts) stop arriving.
     * Safe to call at any time — idempotent.
     * @param {string} wabaId
     */
    async resubscribeWebhook(wabaId) {
        return this._http.post(`/clients/${wabaId}/resubscribe-webhook`);
    }
}

module.exports = Clients;
