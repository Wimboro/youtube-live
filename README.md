# YouTube 24/7 Live Streamer

A web application that allows you to easily manage 24/7 YouTube live streaming with a user-friendly interface.

## Features

- Stream videos to YouTube 24/7 with a user-friendly web interface
- Configure streaming settings through the web dashboard
- Manage media files for streaming
- Upload and delete media files through the dashboard
- View streaming logs in real-time
- Randomize playback order
- Loop playlist continuously
- Responsive design for desktop and mobile

## Requirements

- Node.js 14+
- FFmpeg installed on your system
- YouTube account with live streaming enabled
- YouTube stream key

## Installation

1. Clone this repository:
   ```
   git clone https://github.com/Wimboro/youtube-live.git
   cd youtube-live
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Make sure FFmpeg is installed on your system:
   - On Ubuntu/Debian: `sudo apt-get install ffmpeg`
   - On macOS with Homebrew: `brew install ffmpeg`
   - On Windows: Download from [FFmpeg.org](https://ffmpeg.org/download.html)

4. Create a media directory and add your video files:
   ```
   mkdir media
   ```
   Add your MP4, MOV, MKV, AVI, or other video files to this directory.

5. Start the application:
   ```
   npm start
   ```

6. Open your web browser and navigate to `http://localhost:3001`

## Docker

You can run the application in a container with FFmpeg preinstalled.

1. Build the image:
   ```
   docker build -t youtube-live .
   ```
2. Run the container:
   ```
   docker run -p 3001:3001 \
     -v $(pwd)/media:/app/media \
     -v $(pwd)/stream_config.db:/app/stream_config.db \
     youtube-live
   ```
   FFmpeg is installed inside the image, so no host setup is required.

## Usage

1. **Configuration**: 
   - Go to Settings and enter your YouTube stream key
   - Configure any other settings as needed

2. **Media Files**:
   - Upload videos directly from the dashboard or add them to the 'media' directory
   - Delete unwanted media files from the dashboard
   - View and manage your media files in the Media Files section
   - Refresh the media list after adding new files

3. **Start Streaming**:
   - Click the "Start Streaming" button on the dashboard
   - Monitor streaming status and logs
   - Stop the stream at any time with the "Stop Streaming" button

## Environment Variables

You can configure the application using the following environment variables:
- `PORT`: Web server port (default: 3001)
- `YOUTUBE_STREAM_KEY`: Your YouTube stream key
- `MEDIA_DIRECTORY`: Path to media files (default: ./media)

## Production Deployment

For production usage:

1. Set up a proper process manager like PM2:
   ```
   npm install -g pm2
   pm2 start server.js --name youtube-live
   ```

2. Consider setting up NGINX as a reverse proxy with SSL

## Troubleshooting

- Make sure FFmpeg is properly installed and accessible in your PATH
- Verify your YouTube stream key is correct
- Check that you have proper permissions for the media directory
- Look at the stream logs for detailed error messages

## License

MIT 
