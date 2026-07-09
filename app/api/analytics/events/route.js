import { NextResponse } from 'next/server';

const events = [];

export async function POST(request) {
    const body = await request.json();
    const { name, properties } = body;

    const event = {
        id: crypto.randomUUID(),
        name,
        properties: properties || {},
        timestamp: new Date().toISOString()
    };

    events.push(event);

    return NextResponse.json({ success: true, data: event });
}

export async function GET() {
    const report = {
        total: events.length,
        byName: {},
        lastHour: events.filter(e => {
            const diff = Date.now() - new Date(e.timestamp).getTime();
            return diff < 3600000;
        }).length
    };

    for (const event of events) {
        report.byName[event.name] = (report.byName[event.name] || 0) + 1;
    }

    return NextResponse.json({ success: true, data: report });
}
