'use strict';

class Analytics {
    constructor(http) {
        this._http = http;
    }

    /**
     * Get message delivery analytics for a WABA.
     * @param {string} wabaId
     * @param {object} [opts]
     * @param {number} [opts.days] - Number of days to look back (default: 7, max: 30)
     */
    async get(wabaId, { days = 7 } = {}) {
        return this._http.get(`/analytics?days=${days}`, { headers: { 'x-waba-id': wabaId } });
    }
}

module.exports = Analytics;
