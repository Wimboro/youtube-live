'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Home() {
  const [status, setStatus] = useState('stopped');
  const [streamKey, setStreamKey] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/config')
      .then((res) => res.json())
      .then((data) => {
        setStatus(data.isStreaming ? 'streaming' : 'stopped');
        setStreamKey(data.config?.streamKey || '');
      });
  }, []);

  const startStream = async () => {
    setLoading(true);
    await fetch('/api/stream/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ streamKey }),
    });
    setStatus('streaming');
    setLoading(false);
  };

  const stopStream = async () => {
    setLoading(true);
    await fetch('/api/stream/stop', { method: 'POST' });
    setStatus('stopped');
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4 p-4">
      <h1 className="text-2xl font-bold">YouTube Live Streamer</h1>
      <input
        className="w-64 rounded border p-2"
        placeholder="Stream Key"
        value={streamKey}
        onChange={(e) => setStreamKey(e.target.value)}
      />
      {status === 'streaming' ? (
        <Button onClick={stopStream} disabled={loading} variant="outline">
          Stop Streaming
        </Button>
      ) : (
        <Button onClick={startStream} disabled={loading}>
          Start Streaming
        </Button>
      )}
      <p className="text-sm text-gray-600">Status: {status}</p>
    </main>
  );
}
