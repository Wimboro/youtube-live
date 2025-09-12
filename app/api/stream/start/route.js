import { NextResponse } from 'next/server';
import { startStream, saveConfig } from '@/lib/stream';

export async function POST(req) {
  const body = await req.json();
  if (body.streamKey) {
    await saveConfig({ streamKey: body.streamKey });
  }
  const success = startStream(body);
  return NextResponse.json({ success });
}
