'use strict';

class Broadcasts {
    constructor(http) {
        this._http = http;
    }

    /**
     * Create and start a broadcast.
     * @param {string} wabaId
     * @param {object} opts
     * @param {string}   opts.templateName       - Approved template name
     * @param {string}   [opts.templateLanguage] - Language code (default: 'en_US')
     * @param {Array}    [opts.templateComponents] - Template components (params)
     * @param {Array}    opts.contacts            - Array of phone strings OR { phone, params }
     * @param {string}   [opts.name]              - Broadcast label
     * @param {string}   [opts.scheduledAt]       - ISO datetime to schedule (optional)
     */
    async create(wabaId, { templateName, templateLanguage = 'en_US', templateComponents = [], contacts, name, scheduledAt } = {}) {
        return this._http.post('/broadcasts', {
            template_name:       templateName,
            template_language:   templateLanguage,
            template_components: templateComponents,
            contacts,
            name,
            scheduled_at: scheduledAt || null
        }, { headers: { 'x-waba-id': wabaId } });
    }

    /**
     * List all broadcasts.
     * @param {object} [opts]
     * @param {number} [opts.limit]  - Max results (default 20)
     * @param {number} [opts.offset] - Pagination offset
     */
    async list({ limit = 20, offset = 0 } = {}) {
        return this._http.get(`/broadcasts?limit=${limit}&offset=${offset}`);
    }

    /**
     * Get broadcast status and progress.
     * @param {number|string} broadcastId
     */
    async get(broadcastId) {
        return this._http.get(`/broadcasts/${broadcastId}`);
    }

    /**
     * Cancel a pending or scheduled broadcast.
     * @param {number|string} broadcastId
     */
    async cancel(broadcastId) {
        return this._http.post(`/broadcasts/${broadcastId}/cancel`);
    }
}

module.exports = Broadcasts;
