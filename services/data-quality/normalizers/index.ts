export function capitalizeNames(text: string): string {
    return text
        .toLowerCase()
        .replace(/\b\w/g, (l) => l.toUpperCase());
}

export function normalizePrice(price: number): number {
    return Math.round(price * 100) / 100;
}

export function normalizeText(text: string): string {
    return text
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, " ")
        .trim();
}

export function normalizePhone(phone: string): string {
    return phone.replace(/[^0-9+]/g, "");
}

export function normalizeEmail(email: string): string {
    return email.trim().toLowerCase();
}
