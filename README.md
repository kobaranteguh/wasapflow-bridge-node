# @wasapflow/bridge

Official Node.js SDK for **WasapFlow Bridge** — use Meta WhatsApp Cloud API through WasapFlow as Tech Provider. Partner tidak perlu apply jadi Tech Provider sendiri.

## Installation

```bash
npm install @wasapflow/bridge
```

## Quick Start

```javascript
const { WasapFlowBridge } = require('@wasapflow/bridge');

const bridge = new WasapFlowBridge({
    partnerKey:    process.env.WF_PARTNER_KEY,    // wf_live_xxx
    webhookSecret: process.env.WF_WEBHOOK_SECRET,  // whsec_xxx
    baseUrl:       'https://api.wasapflow.com'      // your WasapFlow host
});
```

---

## Register Client (After Embedded Signup)

```javascript
await bridge.clients.register({
    wabaId:       '123456789',
    phoneNumberId: '987654321',
    accessToken:  'EAAxxxxx',
    displayName:  'Kedai ABC'
});
```

---

## Send Messages

```javascript
const waba = bridge.client('123456789'); // wabaId

// Text
await waba.messages.send({ to: '60123456789', text: 'Hello!' });

// Template
await waba.messages.template({
    to:       '60123456789',
    template: 'order_confirmed',
    language: 'ms',
    params:   ['John', 'RM50.00']
});

// Image
await waba.messages.image({
    to:      '60123456789',
    url:     'https://example.com/product.jpg',
    caption: 'Produk terbaru'
});

// Document
await waba.messages.document({
    to:       '60123456789',
    url:      'https://example.com/invoice.pdf',
    filename: 'Invoice-001.pdf',
    caption:  'Invoice anda'
});

// Buttons (interactive)
await waba.messages.buttons({
    to:      '60123456789',
    body:    'Pilih pakej:',
    buttons: [
        { id: 'basic', title: 'Basic RM29' },
        { id: 'pro',   title: 'Pro RM79' }
    ]
});

// List
await waba.messages.list({
    to:         '60123456789',
    body:       'Pilih produk:',
    buttonText: 'Lihat Produk',
    sections:   [{
        title: 'Kategori A',
        rows:  [
            { id: 'prod_1', title: 'Produk 1', description: 'RM 10' },
            { id: 'prod_2', title: 'Produk 2', description: 'RM 20' }
        ]
    }]
});
```

---

## Check Contact (WhatsApp Status)

```javascript
const result = await bridge.contacts.check('60123456789', '123456789');
// { success: true, phone: '60123456789', whatsapp_id: '60123456789', status: 'valid' }
```

---

## Upload Media

```javascript
const media = await bridge.contacts.uploadMedia({
    url:      'https://example.com/image.jpg',
    mimeType: 'image/jpeg',
    wabaId:   '123456789'
});

// Use media_id in messages (no re-upload needed)
await waba.messages.image({ to: '60123456789', mediaId: media.media_id });
```

---

## Receive Webhooks (Express)

```javascript
const express = require('express');
const app = express();

// PENTING: guna express.raw untuk signature verification
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const event = bridge.webhooks.verify(req.headers, req.body);

    if (!event) return res.status(401).send('Invalid signature');

    res.status(200).send('OK'); // Hantar 200 dulu

    switch (event.event) {
        case 'message.received':
            // 🆔 event.data.bsuid is the Business-Scoped User ID — a stable
            // identifier that survives WhatsApp username changes (rollout Jun 2026).
            // Recommended: store BOTH `from` (phone) and `bsuid` for each contact.
            console.log(`📩 Message from ${event.data.from} (bsuid: ${event.data.bsuid}): ${event.data.text}`);
            break;

        case 'message.delivered':
            console.log(`✅ Delivered: ${event.data.message_id}`);
            break;

        case 'message.read':
            console.log(`👁️ Read: ${event.data.message_id}`);
            break;

        case 'message.failed':
            console.log(`❌ Failed: ${event.data.message_id}`, event.data.errors);
            break;

        case 'waba.quality_updated':
            console.log(`Quality: ${event.data.previous_rating} → ${event.data.quality_rating}`);
            break;

        case 'waba.tier_updated':
            console.log(`Tier updated: ${event.data.tier}`);
            break;
    }
});
```

---

## Error Handling

```javascript
try {
    await waba.messages.send({ to: '601234', text: 'Hello' });
} catch (err) {
    switch (err.code) {
        case 'RATE_LIMIT_EXCEEDED':
            console.log(`Rate limited. Retry after ${err.retryAfterMs}ms`);
            break;
        case 'TRIAL_EXPIRED':
            console.log('Subscribe to continue');
            break;
        case 'PAYMENT_FAILED':
            console.log('Payment failed — update billing');
            break;
        case 'META_ERROR':
            console.log('Meta error:', err.bridgeError?.meta_code, err.bridgeError?.meta_message);
            break;
        default:
            console.error('Error:', err.message);
    }
}
```

---

## Manage WABAs

```javascript
// List all registered WABAs
const { clients } = await bridge.clients.list();

// Remove a WABA
await bridge.clients.remove('123456789');

// Refresh quality/tier from Meta
const info = await bridge.clients.refresh('123456789');
console.log(info.tier, info.quality_rating);
```

---

## Error Codes

| Code | HTTP | Meaning |
|---|---|---|
| `INVALID_PARTNER_KEY` | 401 | Partner key salah |
| `TRIAL_EXPIRED` | 403 | Trial tamat |
| `PAYMENT_FAILED` | 402 | Pembayaran gagal |
| `SUBSCRIPTION_CANCELLED` | 403 | Subscription dibatalkan |
| `PARTNER_SUSPENDED` | 403 | Akaun di-suspend |
| `RATE_LIMIT_EXCEEDED` | 429 | Terlalu banyak request |
| `WABA_NOT_REGISTERED` | 200 | WABA belum didaftar |
| `WABA_LIMIT_REACHED` | 200 | Had WABA plan |
| `META_ERROR` | 502 | Error dari Meta API |

---

## TypeScript Support

```typescript
import { WasapFlowBridge, BridgeEvent } from '@wasapflow/bridge';

const bridge = new WasapFlowBridge({ partnerKey: '...' });

function handleEvent(event: BridgeEvent) {
    if (event.event === 'message.received') {
        console.log(event.data.from, event.data.text);
    }
}
```
