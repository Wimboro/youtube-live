import { NextResponse } from 'next/server';
import { saveConfig } from '@/lib/stream';

export async function POST(req) {
  const body = await req.json();
  const config = await saveConfig(body);
  return NextResponse.json({ success: true, config });
}
