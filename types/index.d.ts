export interface BridgeConfig {
    partnerKey: string;
    webhookSecret?: string;
    baseUrl?: string;
    timeout?: number;
}

export interface RegisterClientOptions {
    wabaId: string;
    phoneNumberId: string;
    accessToken: string;
    displayName?: string;
}

export interface SendTextOptions {
    to: string;
    text: string;
    previewUrl?: boolean;
}

export interface SendTemplateOptions {
    to: string;
    template: string;
    language?: string;
    params?: string[];
    components?: object[];
}

export interface SendMediaOptions {
    to: string;
    url?: string;
    mediaId?: string;
    caption?: string;
    filename?: string;
}

export interface SendButtonsOptions {
    to: string;
    body: string;
    buttons: Array<{ id: string; title: string }>;
    header?: string;
    footer?: string;
}

export interface SendListOptions {
    to: string;
    body: string;
    buttonText?: string;
    sections: Array<{
        title: string;
        rows: Array<{ id: string; title: string; description?: string }>;
    }>;
    header?: string;
    footer?: string;
}

export interface SendLocationOptions {
    to: string;
    latitude: number;
    longitude: number;
    name?: string;
    address?: string;
}

export interface SendReactionOptions {
    to: string;
    message_id: string;
    emoji: string;
}

export interface CreateTemplateOptions {
    name: string;
    language: string;
    category: 'MARKETING' | 'UTILITY' | 'AUTHENTICATION';
    components: object[];
}

export interface CreateBroadcastOptions {
    templateName: string;
    templateLanguage?: string;
    templateComponents?: object[];
    contacts: string[] | Array<{ phone: string; params?: object }>;
    name?: string;
    scheduledAt?: string;
}

export interface UpdateProfileOptions {
    about?: string;
    address?: string;
    description?: string;
    email?: string;
    websites?: string[];
    vertical?: string;
}

export interface BridgeEvent {
    event: 'message.received' | 'message.sent' | 'message.delivered' | 'message.read' | 'message.failed' | 'waba.tier_updated' | 'waba.quality_updated' | 'waba.alert';
    waba_id: string;
    phone_number_id: string;
    timestamp: number;
    data: {
        from?: string;
        /**
         * 🆔 Business-Scoped User ID (added by Meta April 2026).
         * Format: `CC.xxx` (e.g. `MY.2035200694071263`). Unique per business-user pair.
         * Stable identifier that won't change when user adopts a WhatsApp username
         * (rollout starting June 2026). Recommended: store this alongside `from`
         * as a future-proof customer key.
         */
        bsuid?: string | null;
        message_id?: string;
        type?: string;
        text?: string | null;
        contact_name?: string | null;
        raw?: object;
        status?: string;
        recipient?: string;
        /**
         * 🆔 Recipient's Business-Scoped User ID for outbound status webhooks
         * (message.sent / delivered / read / failed). See `bsuid` above.
         */
        recipient_bsuid?: string | null;
        errors?: object[] | null;
        tier?: string;
        quality_rating?: string;
        previous_rating?: string;
    };
}

export declare class Messages {
    send(opts: SendTextOptions): Promise<{ success: true; message_id: string; waba_id: string }>;
    template(opts: SendTemplateOptions): Promise<{ success: true; message_id: string; waba_id: string }>;
    image(opts: SendMediaOptions): Promise<{ success: true; message_id: string }>;
    document(opts: SendMediaOptions): Promise<{ success: true; message_id: string }>;
    audio(opts: SendMediaOptions): Promise<{ success: true; message_id: string }>;
    video(opts: SendMediaOptions): Promise<{ success: true; message_id: string }>;
    buttons(opts: SendButtonsOptions): Promise<{ success: true; message_id: string }>;
    list(opts: SendListOptions): Promise<{ success: true; message_id: string }>;
    location(opts: SendLocationOptions): Promise<{ success: true; message_id: string }>;
    reaction(opts: SendReactionOptions): Promise<{ success: true }>;
    markRead(messageId: string): Promise<{ success: true }>;
}

export declare class Clients {
    register(opts: RegisterClientOptions): Promise<{ success: true; client: object }>;
    list(): Promise<{ success: true; clients: object[] }>;
    remove(wabaId: string): Promise<{ success: true }>;
    refresh(wabaId: string): Promise<{ success: true; tier: string; quality_rating: string }>;
}

export declare class Contacts {
    check(phone: string, wabaId?: string): Promise<{ success: true; phone: string; whatsapp_id: string | null; status: string }>;
    uploadMedia(opts: { url: string; mimeType: string; wabaId: string; type?: string }): Promise<{ success: true; media_id: string }>;
    downloadMedia(mediaId: string, wabaId: string): Promise<{ success: true; url: string; mime_type: string; file_size: number }>;
}

export declare class Templates {
    list(wabaId: string): Promise<{ success: true; templates: object[] }>;
    create(wabaId: string, opts: CreateTemplateOptions): Promise<{ success: true; template: object }>;
    delete(wabaId: string, templateName: string): Promise<{ success: true }>;
}

export declare class Broadcasts {
    create(wabaId: string, opts: CreateBroadcastOptions): Promise<{ success: true; broadcast_id: number; status: string }>;
    list(opts?: { limit?: number; offset?: number }): Promise<{ success: true; broadcasts: object[] }>;
    get(broadcastId: number | string): Promise<{ success: true; broadcast: object }>;
    cancel(broadcastId: number | string): Promise<{ success: true }>;
}

export declare class Analytics {
    get(wabaId: string, opts?: { days?: number }): Promise<{ success: true; analytics: object }>;
}

export declare class Profile {
    get(wabaId: string): Promise<{ success: true; profile: object }>;
    update(wabaId: string, opts: UpdateProfileOptions): Promise<{ success: true }>;
}

export declare class Webhooks {
    verify(headers: Record<string, string>, rawBody: Buffer | string): BridgeEvent | null;
    parse(body: object): BridgeEvent;
    isValid(headers: Record<string, string>, rawBody: Buffer | string): boolean;
}

export interface ClientScope {
    messages: Messages;
    templates: {
        list(): Promise<{ success: true; templates: object[] }>;
        create(opts: CreateTemplateOptions): Promise<{ success: true; template: object }>;
        delete(name: string): Promise<{ success: true }>;
    };
    broadcasts: {
        create(opts: CreateBroadcastOptions): Promise<{ success: true; broadcast_id: number; status: string }>;
        list(opts?: { limit?: number; offset?: number }): Promise<{ success: true; broadcasts: object[] }>;
        get(id: number | string): Promise<{ success: true; broadcast: object }>;
        cancel(id: number | string): Promise<{ success: true }>;
    };
    analytics: {
        get(opts?: { days?: number }): Promise<{ success: true; analytics: object }>;
    };
    profile: {
        get(): Promise<{ success: true; profile: object }>;
        update(opts: UpdateProfileOptions): Promise<{ success: true }>;
    };
}

export declare class WasapFlowBridge {
    constructor(config: BridgeConfig);
    clients:    Clients;
    contacts:   Contacts;
    webhooks:   Webhooks;
    templates:  Templates;
    broadcasts: Broadcasts;
    analytics:  Analytics;
    profile:    Profile;
    client(wabaId: string): ClientScope;
}
