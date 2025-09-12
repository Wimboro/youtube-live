import { NextResponse } from 'next/server';
import { loadConfig, getStatus, getMediaList } from '@/lib/stream';

export async function GET() {
  const config = await loadConfig();
  return NextResponse.json({
    isStreaming: getStatus(),
    config,
    mediaFiles: getMediaList(),
  });
}
