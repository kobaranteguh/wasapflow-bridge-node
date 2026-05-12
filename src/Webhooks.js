'use strict';

const crypto = require('crypto');

class Webhooks {
    constructor(secret) {
        this._secret = secret;
    }

    /**
     * Verify webhook signature and parse event.
     * Call this in your webhook endpoint BEFORE processing.
     *
     * @param {object} headers - Raw request headers
     * @param {Buffer|string} rawBody - Raw request body (Buffer preferred for accuracy)
     * @returns {object|null} Parsed event object, or null if signature invalid
     *
     * @example
     * app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
     *     const event = bridge.webhooks.verify(req.headers, req.body);
     *     if (!event) return res.status(401).send('Invalid signature');
     *     res.status(200).send('OK');
     *     // process event...
     * });
     */
    verify(headers, rawBody) {
        const signature = headers['x-wasapflow-signature'];
        if (!signature || !this._secret) return null;

        const bodyStr = Buffer.isBuffer(rawBody) ? rawBody.toString('utf8') : rawBody;
        const expected = 'sha256=' + crypto
            .createHmac('sha256', this._secret)
            .update(bodyStr)
            .digest('hex');

        if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) {
            return null;
        }

        try {
            return JSON.parse(bodyStr);
        } catch {
            return null;
        }
    }

    /**
     * Parse event without verifying signature (use only for testing).
     * @param {object} body - Parsed request body
     * @returns {object} Normalized event
     */
    parse(body) {
        return body;
    }

    /**
     * Check if signature is valid (without parsing body).
     * @param {object} headers
     * @param {Buffer|string} rawBody
     * @returns {boolean}
     */
    isValid(headers, rawBody) {
        return this.verify(headers, rawBody) !== null;
    }
}

module.exports = Webhooks;
