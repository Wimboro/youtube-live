document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const liveIndicator = document.getElementById('liveIndicator');
  const streamPlayer = document.getElementById('streamPlayer');
  const offlineMessage = document.getElementById('offlineMessage');
  const streamTitle = document.getElementById('streamTitle');
  const viewerCountDisplay = document.getElementById('viewerCountDisplay');
  const streamDurationDisplay = document.getElementById('streamDurationDisplay');
  const streamStartTime = document.getElementById('streamStartTime');
  const streamDate = document.getElementById('streamDate');
  const chatMessages = document.getElementById('chatMessages');
  const chatInput = document.getElementById('chatInput');
  const sendChatBtn = document.getElementById('sendChatBtn');
  const chatUserCount = document.getElementById('chatUserCount');
  const totalViewers = document.getElementById('totalViewers');
  const peakViewersDisplay = document.getElementById('peakViewersDisplay');
  const uptime = document.getElementById('uptime');
  const chatMessagesCount = document.getElementById('chatMessagesCount');

  // Socket.io connection
  const socket = io();
  
  // App state
  let viewerState = {
    isLive: false,
    viewerCount: 0,
    peakViewers: 0,
    totalViews: 0,
    streamStarted: null,
    chatMessageCount: 0,
    simulatedUsers: ['StreamFan123', 'VideoLover', 'LiveWatcher', 'ContentViewer', 'StreamBot', 'WatcherPro'],
    myUsername: 'Viewer' + Math.floor(Math.random() * 1000)
  };

  // Initialize viewer simulation
  const initializeViewer = () => {
    // Simulate viewer count
    viewerState.viewerCount = Math.floor(Math.random() * 50) + 10;
    viewerState.peakViewers = viewerState.viewerCount + Math.floor(Math.random() * 20);
    viewerState.totalViews = Math.floor(Math.random() * 1000) + 100;
    
    updateViewerUI();
    
    // Start viewer count fluctuation
    setInterval(() => {
      if (viewerState.isLive) {
        const change = Math.floor(Math.random() * 6) - 3; // -3 to +3
        viewerState.viewerCount = Math.max(5, viewerState.viewerCount + change);
        
        if (viewerState.viewerCount > viewerState.peakViewers) {
          viewerState.peakViewers = viewerState.viewerCount;
        }
        
        viewerState.totalViews += Math.floor(Math.random() * 3);
        updateViewerUI();
      }
    }, 5000);

    // Simulate chat messages
    setInterval(() => {
      if (viewerState.isLive && Math.random() < 0.3) {
        addSimulatedChatMessage();
      }
    }, 8000);

    // Update uptime
    setInterval(updateUptime, 1000);
  };

  // Update viewer UI
  const updateViewerUI = () => {
    viewerCountDisplay.textContent = viewerState.viewerCount.toLocaleString();
    totalViewers.textContent = viewerState.totalViews.toLocaleString();
    peakViewersDisplay.textContent = viewerState.peakViewers.toLocaleString();
    chatUserCount.textContent = `${Math.floor(viewerState.viewerCount * 0.3)} users`;
    chatMessagesCount.textContent = viewerState.chatMessageCount.toLocaleString();
  };

  // Update stream status
  const updateStreamStatus = (isStreaming) => {
    viewerState.isLive = isStreaming;
    
    if (isStreaming) {
      liveIndicator.style.display = 'inline-block';
      streamDurationDisplay.style.display = 'inline-block';
      
      if (!viewerState.streamStarted) {
        viewerState.streamStarted = new Date();
        streamStartTime.textContent = viewerState.streamStarted.toLocaleTimeString();
        streamDate.textContent = viewerState.streamStarted.toLocaleDateString();
      }
      
      // Show live stream placeholder
      streamPlayer.innerHTML = `
        <div class="d-flex align-items-center justify-content-center h-100">
          <div class="text-center">
            <div class="spinner-border text-danger mb-3" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <h4 class="text-danger">
              <i class="bi bi-broadcast"></i> LIVE STREAM
            </h4>
            <p class="text-muted">Stream is currently active</p>
            <small class="text-muted">
              In a real implementation, this would show the actual video stream
            </small>
          </div>
        </div>
      `;
      
      // Enable chat
      chatInput.disabled = false;
      sendChatBtn.disabled = false;
      
      addSystemMessage('Stream is now live! 🔴');
      
    } else {
      liveIndicator.style.display = 'none';
      streamDurationDisplay.style.display = 'none';
      viewerState.streamStarted = null;
      
      streamPlayer.innerHTML = `
        <div class="d-flex align-items-center justify-content-center h-100">
          <div class="text-center">
            <i class="bi bi-broadcast-pin" style="font-size: 4rem; color: #666;"></i>
            <h4 class="mt-3 text-muted">Stream Offline</h4>
            <p class="text-muted">The stream is not currently live. Check back later!</p>
          </div>
        </div>
      `;
      
      // Disable chat
      chatInput.disabled = true;
      sendChatBtn.disabled = true;
      
      addSystemMessage('Stream has ended. Thanks for watching! 📺');
    }
    
    updateViewerUI();
  };

  // Add chat message
  const addChatMessage = (username, message, isSystem = false) => {
    const messageElement = document.createElement('div');
    messageElement.className = 'chat-message';
    
    if (isSystem) {
      messageElement.innerHTML = `<span class="text-warning"><i class="bi bi-info-circle"></i> ${message}</span>`;
    } else {
      messageElement.innerHTML = `
        <span class="chat-username">${username}</span>
        <span>${message}</span>
      `;
    }
    
    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    
    viewerState.chatMessageCount++;
    updateViewerUI();
    
    // Keep only last 50 messages
    while (chatMessages.children.length > 50) {
      chatMessages.removeChild(chatMessages.firstChild);
    }
  };

  // Add system message
  const addSystemMessage = (message) => {
    addChatMessage('', message, true);
  };

  // Add simulated chat message
  const addSimulatedChatMessage = () => {
    const messages = [
      'Great stream! 👍',
      'Love this content',
      'Hello everyone! 👋',
      'This is awesome!',
      'Keep it up! 🔥',
      'Amazing quality',
      'First time watching, love it!',
      'How long have you been streaming?',
      'This is so cool! 😎',
      'Thanks for the stream!',
      'What\'s coming up next?',
      'Been watching for hours! ⏰',
      'Quality content as always',
      'Love the music choice',
      'This is relaxing 😌',
      'Perfect for background viewing'
    ];
    
    const randomUser = viewerState.simulatedUsers[Math.floor(Math.random() * viewerState.simulatedUsers.length)];
    const randomMessage = messages[Math.floor(Math.random() * messages.length)];
    
    addChatMessage(randomUser, randomMessage);
  };

  // Update uptime
  const updateUptime = () => {
    if (viewerState.isLive && viewerState.streamStarted) {
      const now = new Date();
      const diff = now - viewerState.streamStarted;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      
      uptime.textContent = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      uptime.textContent = '00:00:00';
    }
  };

  // Send chat message
  const sendChatMessage = () => {
    const message = chatInput.value.trim();
    if (message && viewerState.isLive) {
      addChatMessage(viewerState.myUsername, message);
      chatInput.value = '';
    }
  };

  // Event listeners
  chatInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      sendChatMessage();
    }
  });

  sendChatBtn.addEventListener('click', sendChatMessage);

  // Socket events
  socket.on('connect', () => {
    addSystemMessage('Connected to stream server');
  });

  socket.on('disconnect', () => {
    addSystemMessage('Disconnected from stream server');
  });

  socket.on('stream-status', (data) => {
    updateStreamStatus(data.status === 'streaming');
  });

  // Initialize
  initializeViewer();
  
  // Check initial stream status
  fetch('/api/config')
    .then(response => response.json())
    .then(data => {
      updateStreamStatus(data.isStreaming);
    })
    .catch(error => {
      console.error('Error checking stream status:', error);
    });
});

// Share functions
function copyStreamUrl() {
  const url = window.location.href;
  navigator.clipboard.writeText(url).then(() => {
    alert('Stream URL copied to clipboard!');
  }).catch(err => {
    console.error('Failed to copy URL:', err);
  });
}

function shareOnWhatsApp() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent('Check out this live stream!');
  window.open(`https://wa.me/?text=${text} ${url}`, '_blank');
}

function shareOnTwitter() {
  const url = encodeURIComponent(window.location.href);
  const text = encodeURIComponent('Watching an awesome live stream! 🔴');
  window.open(`https://twitter.com/intent/tweet?text=${text}&url=${url}`, '_blank');
}