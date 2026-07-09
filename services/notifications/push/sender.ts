export interface PushNotification {
    title: string;
    body: string;
    data?: Record<string, unknown>;
    userId: string;
}

const subscriptions = new Map<string, PushNotification[]>();

export async function sendPush(notification: PushNotification): Promise<boolean> {
    const userNotifications = subscriptions.get(notification.userId) || [];
    userNotifications.push(notification);
    subscriptions.set(notification.userId, userNotifications);
    return true;
}

export async function sendPriceAlert(
    userId: string,
    productName: string,
    storeName: string,
    price: number
): Promise<boolean> {
    return sendPush({
        title: "¡Precio bajó!",
        body: `${productName} ahora está en $${price.toLocaleString("es-CO")} en ${storeName}.`,
        data: { type: "price_alert" },
        userId
    });
}

export async function sendPromotionAlert(
    userId: string,
    productName: string,
    discount: number
): Promise<boolean> {
    return sendPush({
        title: `${discount}% de descuento`,
        body: `${productName} tiene una promoción del ${discount}% de descuento.`,
        data: { type: "promotion" },
        userId
    });
}
