'use strict';

class Templates {
    constructor(http) {
        this._http = http;
    }

    /**
     * List all WhatsApp message templates for a WABA.
     * @param {string} wabaId
     */
    async list(wabaId) {
        return this._http.get('/templates', { headers: { 'x-waba-id': wabaId } });
    }

    /**
     * Create a new WhatsApp message template.
     * @param {string} wabaId
     * @param {object} opts
     * @param {string} opts.name        - Template name (lowercase, underscores)
     * @param {string} opts.language    - Language code (e.g. 'en_US', 'ms')
     * @param {string} opts.category    - 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
     * @param {Array}  opts.components  - Template components array
     */
    async create(wabaId, { name, language, category, components } = {}) {
        return this._http.post('/templates', { name, language, category, components }, { headers: { 'x-waba-id': wabaId } });
    }

    /**
     * Delete a template by name.
     * @param {string} wabaId
     * @param {string} templateName
     */
    async delete(wabaId, templateName) {
        return this._http.delete(`/templates/${encodeURIComponent(templateName)}`, { headers: { 'x-waba-id': wabaId } });
    }
}

module.exports = Templates;
