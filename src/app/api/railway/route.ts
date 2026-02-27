import { NextResponse } from 'next/server';
import { getAllRailwayData } from '@/lib/railway';

// Force dynamic rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const data = await getAllRailwayData();
    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Failed to fetch Railway data:', error);
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function HEAD() {
  return NextResponse.json({ status: 'ok' });
}
