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
     * @param {string} wabaId
     */
    async refresh(wabaId) {
        return this._http.post(`/clients/${wabaId}/refresh`);
    }
}

module.exports = Clients;
