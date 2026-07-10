import { NextResponse } from 'next/server';
import { db } from '../../../services/database';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '0.1.0',
      services: { api: 'running', database: !!db, search: 'ready' },
    },
  });
}
