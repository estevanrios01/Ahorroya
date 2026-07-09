export interface WhatsAppMessage {
    to: string;
    text: string;
}

export async function sendWhatsApp(message: WhatsAppMessage): Promise<boolean> {
    console.log(`WhatsApp enviado a ${message.to}: ${message.text.slice(0, 50)}...`);
    return true;
}
