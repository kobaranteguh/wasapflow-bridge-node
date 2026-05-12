'use strict';

class Contacts {
    constructor(http) {
        this._http = http;
    }

    /**
     * Check if a phone number is on WhatsApp.
     * @param {string} phone  - Phone number (e.g. "60123456789")
     * @param {string} [wabaId] - WABA ID to use for the lookup (optional if only 1 WABA registered)
     */
    async check(phone, wabaId) {
        const headers = wabaId ? { 'x-waba-id': wabaId } : {};
        return this._http.get(`/contacts/${phone}`, { headers });
    }

    /**
     * Upload media and get a media_id for use in messages.
     * @param {object} opts
     * @param {string} opts.url      - Publicly accessible URL of the file
     * @param {string} opts.mimeType - MIME type (e.g. "image/jpeg", "application/pdf")
     * @param {string} opts.wabaId   - WABA ID to upload under
     * @param {string} [opts.type]   - Optional media type hint
     */
    async uploadMedia({ url, mimeType, wabaId, type } = {}) {
        return this._http.post('/media/upload', {
            url,
            mime_type: mimeType,
            type: type || mimeType.split('/')[0]
        }, {
            headers: { 'x-waba-id': wabaId }
        });
    }

    /**
     * Get a download URL for a media file received via webhook.
     * @param {string} mediaId - Meta media_id from an inbound webhook
     * @param {string} wabaId  - WABA ID that received the media
     */
    async downloadMedia(mediaId, wabaId) {
        return this._http.get(`/media/${encodeURIComponent(mediaId)}`, { headers: { 'x-waba-id': wabaId } });
    }
}

module.exports = Contacts;
