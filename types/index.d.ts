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

export interface BridgeEvent {
    event: 'message.received' | 'message.sent' | 'message.delivered' | 'message.read' | 'message.failed' | 'waba.tier_updated' | 'waba.quality_updated' | 'waba.alert';
    waba_id: string;
    phone_number_id: string;
    timestamp: number;
    data: {
        // message.received
        from?: string;
        message_id?: string;
        type?: string;
        text?: string | null;
        contact_name?: string | null;
        raw?: object;
        // status events
        status?: string;
        recipient?: string;
        errors?: object[] | null;
        // waba events
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
}

export declare class Webhooks {
    verify(headers: Record<string, string>, rawBody: Buffer | string): BridgeEvent | null;
    parse(body: object): BridgeEvent;
    isValid(headers: Record<string, string>, rawBody: Buffer | string): boolean;
}

export declare class WasapFlowBridge {
    constructor(config: BridgeConfig);
    clients: Clients;
    contacts: Contacts;
    webhooks: Webhooks;
    client(wabaId: string): { messages: Messages };
}
