# YouTube 24/7 Live Streamer

A web application redesigned with **Next.js 15**, **React**, **Tailwind CSS**, and **shadcn/ui** for managing 24/7 YouTube live streams.

## Features

- Stream videos to YouTube using FFmpeg
- Configure streaming settings through a modern Next.js dashboard
- Manage media files for streaming
- Responsive UI built with Tailwind CSS and shadcn/ui components

## Requirements

- Node.js 18+
- FFmpeg installed on your system
- YouTube account with live streaming enabled
- YouTube stream key

## Installation

```bash
npm install
```

## Development

Run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to use the app.

## Environment Variables

- `YOUTUBE_STREAM_KEY`: Your YouTube stream key
- `MEDIA_DIRECTORY`: Path to media files (default: `./media`)

## License

MIT
