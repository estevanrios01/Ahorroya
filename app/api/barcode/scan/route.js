import { NextResponse } from 'next/server';

const scans = [];

export async function POST(request) {
    const body = await request.json();
    const { code, format } = body;

    const scan = {
        id: crypto.randomUUID(),
        code,
        format: format || 'EAN-13',
        valid: /^\d{8,13}$/.test(code),
        scannedAt: new Date().toISOString()
    };

    scans.push(scan);

    return NextResponse.json({ success: true, data: scan });
}

export async function GET() {
    return NextResponse.json({ success: true, data: scans.slice(-50).reverse() });
}
