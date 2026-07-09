export interface EmailMessage {
    to: string;
    subject: string;
    body: string;
    html?: string;
}

const sent: EmailMessage[] = [];

export async function sendEmail(message: EmailMessage): Promise<boolean> {
    sent.push(message);
    console.log(`Email enviado a ${message.to}: ${message.subject}`);
    return true;
}

export async function sendPriceReport(
    email: string,
    productName: string,
    stores: Array<{ name: string; price: number }>
): Promise<boolean> {
    const rows = stores.map((s) => `${s.name}: $${s.price.toLocaleString("es-CO")}`).join("\n");
    return sendEmail({
        to: email,
        subject: `Reporte de precios: ${productName}`,
        body: `Comparación de precios para ${productName}:\n\n${rows}`
    });
}
