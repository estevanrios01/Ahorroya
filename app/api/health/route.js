import { NextResponse } from 'next/server';

export async function GET() {
    const status = {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '0.1.0',
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        services: {
            api: 'running',
            searchIndex: 'ready',
            imageEngine: 'ready',
            geoEngine: 'ready',
        }
    };

    return NextResponse.json({ success: true, data: status });
}
