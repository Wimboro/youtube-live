require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');
const ffmpeg = require('fluent-ffmpeg');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Global streaming process reference
let streamProcess = null;
let isStreaming = false;
let currentConfig = {
  streamKey: process.env.YOUTUBE_STREAM_KEY || '',
  mediaDirectory: process.env.MEDIA_DIRECTORY || './media',
  randomize: true,
  loop: true
};

// Create media directory if it doesn't exist
if (!fs.existsSync(currentConfig.mediaDirectory)) {
  fs.mkdirSync(currentConfig.mediaDirectory, { recursive: true });
}

// Function to get available media files
const getMediaFiles = () => {
  try {
    return fs.readdirSync(currentConfig.mediaDirectory)
      .filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.mp4', '.mov', '.mkv', '.avi', '.wmv', '.flv'].includes(ext);
      })
      .map(file => path.join(currentConfig.mediaDirectory, file));
  } catch (error) {
    console.error('Error reading media directory:', error);
    return [];
  }
};

// Function to start YouTube stream
const startStream = (config) => {
  if (isStreaming) {
    stopStream();
  }
  
  const mediaFiles = getMediaFiles();
  if (mediaFiles.length === 0) {
    io.emit('stream-status', { 
      status: 'error', 
      message: 'No media files found in directory' 
    });
    return false;
  }

  try {
    // Sort files as needed
    const files = config.randomize 
      ? [...mediaFiles].sort(() => Math.random() - 0.5) 
      : mediaFiles;
    
    // Create a playlist file
    const playlistPath = path.join(__dirname, 'playlist.txt');
    const playlistContent = files.map(file => `file '${file}'`).join('\n');
    fs.writeFileSync(playlistPath, playlistContent);
    
    // FFmpeg command for streaming to YouTube
    const streamKey = config.streamKey || '';
    if (!streamKey) {
      io.emit('stream-status', { 
        status: 'error', 
        message: 'YouTube stream key is required' 
      });
      return false;
    }
    
    const args = [
      '-re',
      '-f', 'concat',
      '-safe', '0',
      '-i', playlistPath,
      '-c:v', 'libx264',
      '-preset', 'medium',
      '-b:v', '2500k',
      '-maxrate', '2500k',
      '-bufsize', '5000k',
      '-pix_fmt', 'yuv420p',
      '-g', '60',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-ar', '44100',
      '-f', 'flv',
      `rtmp://a.rtmp.youtube.com/live2/${streamKey}`
    ];
    
    if (config.loop) {
      args.unshift('-stream_loop', '-1');
    }
    
    streamProcess = spawn('ffmpeg', args);
    
    streamProcess.stdout.on('data', (data) => {
      console.log(`stdout: ${data}`);
    });
    
    streamProcess.stderr.on('data', (data) => {
      console.log(`stderr: ${data}`);
      io.emit('stream-log', data.toString());
    });
    
    streamProcess.on('close', (code) => {
      console.log(`FFmpeg process exited with code ${code}`);
      isStreaming = false;
      io.emit('stream-status', { status: 'stopped', message: `Stream ended with code ${code}` });
    });
    
    isStreaming = true;
    currentConfig = { ...config };
    io.emit('stream-status', { status: 'streaming', message: 'Stream started successfully' });
    return true;
  } catch (error) {
    console.error('Error starting stream:', error);
    io.emit('stream-status', { status: 'error', message: error.message });
    return false;
  }
};

// Function to stop stream
const stopStream = () => {
  if (streamProcess) {
    streamProcess.kill('SIGINT');
    streamProcess = null;
    isStreaming = false;
    io.emit('stream-status', { status: 'stopped', message: 'Stream stopped' });
    return true;
  }
  return false;
};

// Routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/config', (req, res) => {
  res.json({
    isStreaming,
    config: currentConfig,
    mediaFiles: getMediaFiles().map(file => path.basename(file))
  });
});

app.post('/api/stream/start', (req, res) => {
  const config = {
    ...currentConfig,
    ...req.body
  };
  
  const result = startStream(config);
  res.json({ success: result });
});

app.post('/api/stream/stop', (req, res) => {
  const result = stopStream();
  res.json({ success: result });
});

// Socket.io connection
io.on('connection', (socket) => {
  console.log('Client connected');
  socket.emit('stream-status', { 
    status: isStreaming ? 'streaming' : 'stopped',
    message: isStreaming ? 'Stream is active' : 'Stream is not running'
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 