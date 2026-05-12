'use strict';

class Profile {
    constructor(http) {
        this._http = http;
    }

    /**
     * Get the WhatsApp Business Profile for a WABA.
     * @param {string} wabaId
     */
    async get(wabaId) {
        return this._http.get('/profile', { headers: { 'x-waba-id': wabaId } });
    }

    /**
     * Update the WhatsApp Business Profile.
     * @param {string} wabaId
     * @param {object} opts
     * @param {string} [opts.about]       - About / status text
     * @param {string} [opts.address]     - Business address
     * @param {string} [opts.description] - Business description
     * @param {string} [opts.email]       - Business email
     * @param {Array}  [opts.websites]    - Array of website URLs
     * @param {string} [opts.vertical]    - Business category (e.g. 'RETAIL')
     */
    async update(wabaId, { about, address, description, email, websites, vertical } = {}) {
        return this._http.put('/profile', { about, address, description, email, websites, vertical }, { headers: { 'x-waba-id': wabaId } });
    }
}

module.exports = Profile;
