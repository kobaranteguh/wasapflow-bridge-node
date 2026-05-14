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
     */
    async registerFromCode({ code, displayName } = {}) {
        return this._http.post('/clients/register-from-code', {
            code,
            display_name: displayName || ''
        });
    }

    /**
     * Get Embedded Signup config (Meta App ID and Config ID) for your frontend.
     */
    async getEmbeddedSignupConfig() {
        return this._http.get('/embedded-signup/config');
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
