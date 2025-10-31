import { NextResponse } from 'next/server';
import { stopStream } from '@/lib/stream';

export async function POST() {
  const success = stopStream();
  return NextResponse.json({ success });
}
