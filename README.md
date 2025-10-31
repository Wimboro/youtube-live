# YouTube 24/7 Live Streamer

A web application redesigned with **Next.js 15**, **React**, **Tailwind CSS**, and **shadcn/ui** for managing 24/7 YouTube live streams.

## Support This Project

<p>
  <a href="https://saweria.co/HiddenCyber">
    <img src="https://asset.hiddencyber.online/donate-buttons/saweria.svg" alt="Donasi via Saweria" height="56">
  </a>

  <a href="https://support.hiddencyber.online">
    <img src="https://asset.hiddencyber.online/donate-buttons/qris.svg" alt="Dukungan via QRIS" height="56">
  </a>

  <a href="https://ko-fi.com/hiddencyber">
    <img src="https://asset.hiddencyber.online/donate-buttons/ko-fi.svg" alt="Ko-fi untuk HiddenCyber" height="56">
  </a>

  <a href="https://paypal.me/wimboro">
    <img src="https://asset.hiddencyber.online/donate-buttons/paypal.svg" alt="Donasi via PayPal" height="56">
  </a>
</p>

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
