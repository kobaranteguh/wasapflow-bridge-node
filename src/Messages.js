'use strict';

class Messages {
    constructor(http, wabaId) {
        this._http = http;
        this._wabaId = wabaId;
    }

    _headers() {
        return { 'x-waba-id': this._wabaId };
    }

    /**
     * Send a text message.
     * @param {object} opts
     * @param {string} opts.to          - Recipient phone (e.g. "60123456789")
     * @param {string} opts.text        - Message body
     * @param {boolean} [opts.previewUrl] - Enable link preview
     */
    async send({ to, text, previewUrl = false } = {}) {
        return this._http.post('/messages/send', { to, text, preview_url: previewUrl }, { headers: this._headers() });
    }

    /**
     * Send a template message.
     * @param {object} opts
     * @param {string} opts.to          - Recipient phone
     * @param {string} opts.template    - Template name
     * @param {string} [opts.language]  - Language code (default: 'ms')
     * @param {Array}  [opts.params]    - Body parameter strings
     * @param {Array}  [opts.components] - Full components array (overrides params)
     */
    async template({ to, template: name, language = 'ms', params = [], components } = {}) {
        const templateBody = {
            name,
            language: { code: language },
            components: components || (params.length
                ? [{ type: 'body', parameters: params.map(p => ({ type: 'text', text: String(p) })) }]
                : [])
        };
        return this._http.post('/messages/template', { to, template: templateBody }, { headers: this._headers() });
    }

    /**
     * Send an image.
     * @param {object} opts
     * @param {string} opts.to      - Recipient phone
     * @param {string} opts.url     - Image URL (or use mediaId)
     * @param {string} [opts.mediaId] - Meta media_id (from media.upload)
     * @param {string} [opts.caption] - Optional caption
     */
    async image({ to, url, mediaId, caption } = {}) {
        const media = mediaId ? { id: mediaId, caption } : { link: url, caption };
        return this._http.post('/messages/media', { to, type: 'image', media }, { headers: this._headers() });
    }

    /**
     * Send a document.
     */
    async document({ to, url, mediaId, filename, caption } = {}) {
        const media = mediaId ? { id: mediaId, filename, caption } : { link: url, filename, caption };
        return this._http.post('/messages/media', { to, type: 'document', media }, { headers: this._headers() });
    }

    /**
     * Send an audio file.
     */
    async audio({ to, url, mediaId } = {}) {
        const media = mediaId ? { id: mediaId } : { link: url };
        return this._http.post('/messages/media', { to, type: 'audio', media }, { headers: this._headers() });
    }

    /**
     * Send a video.
     */
    async video({ to, url, mediaId, caption } = {}) {
        const media = mediaId ? { id: mediaId, caption } : { link: url, caption };
        return this._http.post('/messages/media', { to, type: 'video', media }, { headers: this._headers() });
    }

    /**
     * Send an interactive message with reply buttons.
     * @param {object} opts
     * @param {string} opts.to      - Recipient phone
     * @param {string} opts.body    - Message body text
     * @param {Array}  opts.buttons - Array of { id, title }
     * @param {string} [opts.header] - Optional header text
     * @param {string} [opts.footer] - Optional footer text
     */
    async buttons({ to, body, buttons = [], header, footer } = {}) {
        const interactive = {
            type: 'button',
            body: { text: body },
            action: {
                buttons: buttons.map(b => ({ type: 'reply', reply: { id: b.id, title: b.title } }))
            }
        };
        if (header) interactive.header = { type: 'text', text: header };
        if (footer) interactive.footer = { text: footer };
        return this._http.post('/messages/interactive', { to, interactive }, { headers: this._headers() });
    }

    /**
     * Send an interactive list message.
     * @param {object} opts
     * @param {string} opts.to          - Recipient phone
     * @param {string} opts.body        - Message body text
     * @param {string} opts.buttonText  - Button label (e.g. "Choose")
     * @param {Array}  opts.sections    - Array of { title, rows: [{ id, title, description }] }
     */
    async list({ to, body, buttonText = 'Choose', sections = [], header, footer } = {}) {
        const interactive = {
            type: 'list',
            body: { text: body },
            action: { button: buttonText, sections }
        };
        if (header) interactive.header = { type: 'text', text: header };
        if (footer) interactive.footer = { text: footer };
        return this._http.post('/messages/interactive', { to, interactive }, { headers: this._headers() });
    }

    /**
     * Send a raw interactive payload.
     */
    async interactive({ to, interactive } = {}) {
        return this._http.post('/messages/interactive', { to, interactive }, { headers: this._headers() });
    }

    /**
     * Send a location message.
     * @param {object} opts
     * @param {string} opts.to        - Recipient phone
     * @param {number} opts.latitude  - Latitude
     * @param {number} opts.longitude - Longitude
     * @param {string} [opts.name]    - Location name
     * @param {string} [opts.address] - Address string
     */
    async location({ to, latitude, longitude, name, address } = {}) {
        return this._http.post('/messages/location', { to, latitude, longitude, name, address }, { headers: this._headers() });
    }

    /**
     * Send an emoji reaction to a received message.
     * @param {object} opts
     * @param {string} opts.to         - Recipient phone
     * @param {string} opts.message_id - wamid of the message to react to
     * @param {string} opts.emoji      - Emoji character (e.g. "👍")
     */
    async reaction({ to, message_id, emoji } = {}) {
        return this._http.post('/messages/reaction', { to, message_id, emoji }, { headers: this._headers() });
    }

    /**
     * Mark a received message as read.
     * @param {string} messageId - wamid of the message
     */
    async markRead(messageId) {
        return this._http.post('/messages/read', { message_id: messageId }, { headers: this._headers() });
    }
}

module.exports = Messages;
