import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import ffmpeg from 'fluent-ffmpeg';
import Database from '../database.js';

const db = new Database();

let streamProcess = null;
let isStreaming = false;
let currentConfig = {
  streamKey: process.env.YOUTUBE_STREAM_KEY || '',
  mediaDirectory: process.env.MEDIA_DIRECTORY || './media',
  randomize: true,
  loop: true,
};

export async function loadConfig() {
  try {
    const dbConfig = await db.getAllConfig();
    currentConfig = { ...currentConfig, ...dbConfig };
    if (!fs.existsSync(currentConfig.mediaDirectory)) {
      fs.mkdirSync(currentConfig.mediaDirectory, { recursive: true });
    }
  } catch (e) {
    console.error('Error loading config', e);
  }
  return currentConfig;
}

export async function saveConfig(config) {
  currentConfig = { ...currentConfig, ...config };
  await db.updateMultipleConfig(currentConfig);
  if (!fs.existsSync(currentConfig.mediaDirectory)) {
    fs.mkdirSync(currentConfig.mediaDirectory, { recursive: true });
  }
  return currentConfig;
}

function getMediaFiles() {
  try {
    return fs
      .readdirSync(currentConfig.mediaDirectory)
      .filter((file) => ['.mp4', '.mov', '.mkv', '.avi', '.wmv', '.flv'].includes(path.extname(file).toLowerCase()))
      .map((file) => path.join(currentConfig.mediaDirectory, file));
  } catch (e) {
    console.error('Error reading media directory', e);
    return [];
  }
}

export function startStream(config = currentConfig) {
  if (isStreaming) {
    stopStream();
  }

  const files = getMediaFiles();
  if (!files.length) {
    return false;
  }

  const playlistPath = path.join(process.cwd(), 'playlist.txt');
  const playlistContent = (config.randomize ? [...files].sort(() => Math.random() - 0.5) : files)
    .map((file) => `file '${file}'`)
    .join('\n');
  fs.writeFileSync(playlistPath, playlistContent);

  const streamKey = config.streamKey || '';
  if (!streamKey) {
    return false;
  }

  const args = [
    '-re',
    '-f', 'concat',
    '-safe', '0',
    '-i', playlistPath,
    '-c:v', 'libx264',
    '-c:a', 'aac',
    '-b:v', '4500k',
    '-b:a', '128k',
    '-f', 'flv',
    `rtmp://a.rtmp.youtube.com/live2/${streamKey}`,
  ];

  streamProcess = spawn('ffmpeg', args);
  isStreaming = true;

  streamProcess.on('exit', () => {
    isStreaming = false;
    streamProcess = null;
  });

  return true;
}

export function stopStream() {
  if (streamProcess) {
    streamProcess.kill('SIGINT');
    streamProcess = null;
    isStreaming = false;
    return true;
  }
  return false;
}

export function getStatus() {
  return isStreaming;
}

export function getMediaList() {
  return getMediaFiles().map((file) => path.basename(file));
}
