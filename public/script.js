document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const startBtn = document.getElementById('startBtn');
  const stopBtn = document.getElementById('stopBtn');
  const statusAlert = document.getElementById('statusAlert');
  const streamTitle = document.getElementById('streamTitle');
  const streamStatus = document.getElementById('streamStatus');
  const streamIndicator = document.getElementById('streamIndicator');
  const logOutput = document.getElementById('logOutput');
  const configStreamKey = document.getElementById('configStreamKey');
  const configMediaDir = document.getElementById('configMediaDir');
  const configMediaCount = document.getElementById('configMediaCount');
  const mediaPathDisplay = document.getElementById('mediaPathDisplay');
  const streamKeyInput = document.getElementById('streamKeyInput');
  const twitchStreamKeyInput = document.getElementById('twitchStreamKeyInput');
  const facebookStreamKeyInput = document.getElementById('facebookStreamKeyInput');
  const mediaDirectoryInput = document.getElementById('mediaDirectoryInput');
  const randomizeCheckbox = document.getElementById('randomizeCheckbox');
  const loopCheckbox = document.getElementById('loopCheckbox');
  const randomizeSwitch = document.getElementById('randomizeSwitch');
  const loopSwitch = document.getElementById('loopSwitch');
  const toggleStreamKey = document.getElementById('toggleStreamKey');
  const toggleTwitchStreamKey = document.getElementById('toggleTwitchStreamKey');
  const toggleFacebookStreamKey = document.getElementById('toggleFacebookStreamKey');
  const platformSelect = document.getElementById('platformSelect');
  const multiPlatformSwitch = document.getElementById('multiPlatformSwitch');
  const youtubeSettings = document.getElementById('youtubeSettings');
  const twitchSettings = document.getElementById('twitchSettings');
  const facebookSettings = document.getElementById('facebookSettings');
  const mediaTableBody = document.getElementById('mediaTableBody');
  const refreshMediaBtn = document.getElementById('refreshMediaBtn');
  const mediaUploadInput = document.getElementById('mediaUploadInput');
  const uploadMediaBtn = document.getElementById('uploadMediaBtn');
  const clearLogsBtn = document.getElementById('clearLogsBtn');
  const settingsForm = document.getElementById('settingsForm');
  
  // Navigation
  const dashboardView = document.getElementById('dashboardView');
  const mediaView = document.getElementById('mediaView');
  const settingsView = document.getElementById('settingsView');
  const logsView = document.getElementById('logsView');
  const dashboardBtn = document.getElementById('dashboardBtn');
  const mediaBtn = document.getElementById('mediaBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const logsBtn = document.getElementById('logsBtn');
  const sidebarMenu = document.getElementById('sidebarMenu');
  
  // Socket.io connection
  const socket = io();
  
  // App state
  let appState = {
    isStreaming: false,
    config: {
      streamKey: '',
      twitchStreamKey: '',
      facebookStreamKey: '',
      mediaDirectory: './media',
      randomize: true,
      loop: true,
      platform: 'youtube',
      multiPlatform: false
    },
    mediaFiles: [],
    logs: [],
    analytics: {
      viewerCount: 0,
      streamDuration: 0,
      peakViewers: 0,
      chatMessages: 0,
      streamStartTime: null
    }
  };
  
  // Initialize and fetch config
  const initialize = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      
      appState = {
        ...appState,
        isStreaming: data.isStreaming,
        config: data.config,
        mediaFiles: data.mediaFiles || []
      };
      
      updateUI();
      
    } catch (error) {
      console.error('Error initializing app:', error);
      showError('Failed to initialize application. Please refresh the page.');
    }
  };
  
  // View Navigation
  const showView = (view) => {
    dashboardView.classList.add('d-none');
    mediaView.classList.add('d-none');
    settingsView.classList.add('d-none');
    logsView.classList.add('d-none');
    
    view.classList.remove('d-none');
    
    // Update active nav item
    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('active');
    });
    
    if (view === dashboardView) {
      dashboardBtn.classList.add('active');
    }
  };

  const collapseSidebar = () => {
    if (window.innerWidth < 768 && sidebarMenu.classList.contains('show')) {
      const bsCollapse = bootstrap.Collapse.getInstance(sidebarMenu);
      if (bsCollapse) {
        bsCollapse.hide();
      }
    }
  };
  
  // UI Navigation event listeners
  dashboardBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showView(dashboardView);
    dashboardBtn.classList.add('active');
    collapseSidebar();
  });

  mediaBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showView(mediaView);
    mediaBtn.classList.add('active');
    loadMediaFiles();
    collapseSidebar();
  });

  settingsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showView(settingsView);
    settingsBtn.classList.add('active');
    loadSettings();
    collapseSidebar();
  });

  logsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showView(logsView);
    logsBtn.classList.add('active');
    collapseSidebar();
  });
  
  // Update analytics
  const updateAnalytics = () => {
    if (appState.isStreaming) {
      // Simulate viewer count fluctuation
      appState.analytics.viewerCount = Math.floor(Math.random() * 100) + 50;
      if (appState.analytics.viewerCount > appState.analytics.peakViewers) {
        appState.analytics.peakViewers = appState.analytics.viewerCount;
      }
      
      // Update chat messages
      appState.analytics.chatMessages += Math.floor(Math.random() * 3);
      
      // Update duration
      if (appState.analytics.streamStartTime) {
        const now = new Date();
        const diff = Math.floor((now - appState.analytics.streamStartTime) / 1000);
        const hours = Math.floor(diff / 3600);
        const minutes = Math.floor((diff % 3600) / 60);
        document.getElementById('streamDuration').textContent = 
          `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      }
    }
    
    // Update analytics display
    document.getElementById('viewerCount').textContent = appState.analytics.viewerCount;
    document.getElementById('peakViewers').textContent = appState.analytics.peakViewers;
    document.getElementById('chatMessages').textContent = appState.analytics.chatMessages;
  };

  // Update UI based on current state
  const updateUI = () => {
    const { isStreaming, config, mediaFiles } = appState;
    
    // Update UI components based on streaming status
    if (isStreaming) {
      statusAlert.classList.remove('alert-secondary', 'alert-danger');
      statusAlert.classList.add('alert-success');
      statusAlert.innerHTML = '<i class="bi bi-broadcast"></i> Status: Live Streaming';
      
      if (!appState.analytics.streamStartTime) {
        appState.analytics.streamStartTime = new Date();
      }
      
      streamTitle.textContent = 'Streaming Active';
      streamStatus.textContent = 'The stream is currently running on YouTube.';
      
      streamIndicator.classList.add('stream-active');
      streamIndicator.querySelector('.badge').classList.remove('bg-secondary');
      streamIndicator.querySelector('.badge').classList.add('bg-success');
      streamIndicator.querySelector('.badge').textContent = 'Online';
      
      startBtn.disabled = true;
      stopBtn.disabled = false;
    } else {
      statusAlert.classList.remove('alert-success', 'alert-danger');
      statusAlert.classList.add('alert-secondary');
      statusAlert.innerHTML = '<i class="bi bi-broadcast"></i> Status: Not streaming';
      
      appState.analytics.streamStartTime = null;
      appState.analytics.streamDuration = 0;
      
      streamTitle.textContent = 'Not Streaming';
      streamStatus.textContent = 'The stream is currently inactive.';
      
      streamIndicator.classList.remove('stream-active');
      streamIndicator.querySelector('.badge').classList.remove('bg-success');
      streamIndicator.querySelector('.badge').classList.add('bg-secondary');
      streamIndicator.querySelector('.badge').textContent = 'Offline';
      
      startBtn.disabled = false;
      stopBtn.disabled = true;
    }
    
    // Update configuration display
    configStreamKey.textContent = config.streamKey ? '•••••••••••' : 'Not set';
    configMediaDir.textContent = config.mediaDirectory;
    configMediaCount.textContent = mediaFiles.length;
    mediaPathDisplay.textContent = config.mediaDirectory;
    
    // Update quick settings
    randomizeSwitch.checked = config.randomize;
    loopSwitch.checked = config.loop;
    
    // Update analytics
    updateAnalytics();
  };
  
  // Show error message
  const showError = (message) => {
    statusAlert.classList.remove('alert-secondary', 'alert-success');
    statusAlert.classList.add('alert-danger');
    statusAlert.textContent = `Error: ${message}`;
  };
  
  // Add log message
  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    appState.logs.push(`[${timestamp}] ${message}`);
    
    if (appState.logs.length > 100) {
      appState.logs.shift(); // Keep only the last 100 logs
    }
    
    logOutput.textContent = appState.logs.join('\n');
    logOutput.scrollTop = logOutput.scrollHeight; // Auto-scroll to bottom
  };
  
  // Load media files
  const loadMediaFiles = async () => {
    try {
      const response = await fetch('/api/config');
      const data = await response.json();
      
      appState.mediaFiles = data.mediaFiles || [];
      
      // Update media table
      if (appState.mediaFiles.length === 0) {
        mediaTableBody.innerHTML = '<tr><td colspan="6" class="text-center">No media files found</td></tr>';
      } else {
        mediaTableBody.innerHTML = '';
        appState.mediaFiles.forEach((file, index) => {
          const fileExtension = file.split('.').pop().toLowerCase();
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>
              <div class="thumbnail-preview">
                <i class="bi bi-film"></i>
                <div style="font-size: 0.6rem;">${fileExtension.toUpperCase()}</div>
              </div>
            </td>
            <td>
              <div>
                <div class="fw-bold">${file}</div>
                <small class="text-muted">Video file</small>
              </div>
            </td>
            <td><span class="badge bg-secondary">${fileExtension.toUpperCase()}</span></td>
            <td><span class="badge bg-success">Ready</span></td>
            <td>
              <div class="btn-group btn-group-sm">
                <button class="btn btn-outline-info preview-media-btn" data-filename="${file}" title="Preview">
                  <i class="bi bi-eye"></i>
                </button>
                <button class="btn btn-outline-danger delete-media-btn" data-filename="${file}" title="Delete">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </td>
          `;
          mediaTableBody.appendChild(row);
        });

        // Add event listeners for delete buttons
        document.querySelectorAll('.delete-media-btn').forEach(btn => {
          btn.addEventListener('click', async () => {
            const filename = btn.dataset.filename;
            if (!confirm(`Delete ${filename}?`)) return;

            try {
              const response = await fetch(`/api/media/${encodeURIComponent(filename)}`, { method: 'DELETE' });
              const result = await response.json();
              if (result.success) {
                addLog(`Deleted ${filename}`);
                loadMediaFiles();
              } else {
                showError(result.error || 'Failed to delete file');
              }
            } catch (error) {
              console.error('Error deleting media file:', error);
              showError('Error deleting media file');
            }
          });
        });

        // Add event listeners for preview buttons
        document.querySelectorAll('.preview-media-btn').forEach(btn => {
          btn.addEventListener('click', () => {
            const filename = btn.dataset.filename;
            showMediaPreview(filename);
          });
        });
      }
    } catch (error) {
      console.error('Error loading media files:', error);
      mediaTableBody.innerHTML = '<tr><td colspan="6" class="text-center text-danger">Error loading media files</td></tr>';
    }
  };

  // Show media preview
  const showMediaPreview = (filename) => {
    const modal = document.createElement('div');
    modal.className = 'modal fade';
    modal.innerHTML = `
      <div class="modal-dialog modal-lg">
        <div class="modal-content bg-dark">
          <div class="modal-header border-secondary">
            <h5 class="modal-title"><i class="bi bi-film"></i> Preview: ${filename}</h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body text-center">
            <div class="video-player-container mb-3">
              <div class="d-flex align-items-center justify-content-center h-100">
                <div class="text-center">
                  <i class="bi bi-play-circle" style="font-size: 4rem; color: #666;"></i>
                  <p class="mt-3 text-muted">Video Preview</p>
                  <small class="text-muted">In a full implementation, this would show the actual video</small>
                </div>
              </div>
            </div>
            <p class="text-muted">
              <i class="bi bi-info-circle"></i> 
              This video will be included in the streaming playlist when randomization is enabled.
            </p>
          </div>
          <div class="modal-footer border-secondary">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    const bsModal = new bootstrap.Modal(modal);
    bsModal.show();
    
    modal.addEventListener('hidden.bs.modal', () => {
      modal.remove();
    });
  };
  
  // Update platform settings visibility
  const updatePlatformSettings = () => {
    const platform = platformSelect.value;
    const isMulti = multiPlatformSwitch.checked;
    
    // Hide all settings first
    youtubeSettings.style.display = 'none';
    twitchSettings.style.display = 'none';
    facebookSettings.style.display = 'none';
    
    // Show relevant settings
    if (platform === 'youtube' || isMulti) {
      youtubeSettings.style.display = 'block';
    }
    if (platform === 'twitch' || isMulti) {
      twitchSettings.style.display = 'block';
    }
    if (platform === 'facebook' || isMulti) {
      facebookSettings.style.display = 'block';
    }
    
    // Update multi-platform switch based on platform selection
    if (platform === 'multi') {
      multiPlatformSwitch.checked = true;
      youtubeSettings.style.display = 'block';
      twitchSettings.style.display = 'block';
      facebookSettings.style.display = 'block';
    }
  };

  // Load settings
  const loadSettings = () => {
    const { config } = appState;
    
    streamKeyInput.value = config.streamKey || '';
    twitchStreamKeyInput.value = config.twitchStreamKey || '';
    facebookStreamKeyInput.value = config.facebookStreamKey || '';
    mediaDirectoryInput.value = config.mediaDirectory || './media';
    randomizeCheckbox.checked = config.randomize;
    loopCheckbox.checked = config.loop;
    platformSelect.value = config.platform || 'youtube';
    multiPlatformSwitch.checked = config.multiPlatform || false;
    
    updatePlatformSettings();
  };
  
  // Start streaming
  const startStreaming = async () => {
    try {
      // Get current config with quick setting values
      const config = {
        ...appState.config,
        randomize: randomizeSwitch.checked,
        loop: loopSwitch.checked
      };
      
      const response = await fetch('/api/stream/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config)
      });
      
      const result = await response.json();
      
      if (result.success) {
        addLog('Stream started successfully');
      } else {
        addLog('Failed to start stream');
        showError('Failed to start streaming');
      }
    } catch (error) {
      console.error('Error starting stream:', error);
      addLog(`Error starting stream: ${error.message}`);
      showError('Error starting streaming');
    }
  };
  
  // Stop streaming
  const stopStreaming = async () => {
    try {
      const response = await fetch('/api/stream/stop', {
        method: 'POST'
      });
      
      const result = await response.json();
      
      if (result.success) {
        addLog('Stream stopped successfully');
      } else {
        addLog('Failed to stop stream');
        showError('Failed to stop streaming');
      }
    } catch (error) {
      console.error('Error stopping stream:', error);
      addLog(`Error stopping stream: ${error.message}`);
      showError('Error stopping streaming');
    }
  };
  
  // Toggle stream key visibility
  toggleStreamKey.addEventListener('click', () => {
    if (streamKeyInput.type === 'password') {
      streamKeyInput.type = 'text';
      toggleStreamKey.innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
      streamKeyInput.type = 'password';
      toggleStreamKey.innerHTML = '<i class="bi bi-eye"></i>';
    }
  });

  toggleTwitchStreamKey.addEventListener('click', () => {
    if (twitchStreamKeyInput.type === 'password') {
      twitchStreamKeyInput.type = 'text';
      toggleTwitchStreamKey.innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
      twitchStreamKeyInput.type = 'password';
      toggleTwitchStreamKey.innerHTML = '<i class="bi bi-eye"></i>';
    }
  });

  toggleFacebookStreamKey.addEventListener('click', () => {
    if (facebookStreamKeyInput.type === 'password') {
      facebookStreamKeyInput.type = 'text';
      toggleFacebookStreamKey.innerHTML = '<i class="bi bi-eye-slash"></i>';
    } else {
      facebookStreamKeyInput.type = 'password';
      toggleFacebookStreamKey.innerHTML = '<i class="bi bi-eye"></i>';
    }
  });

  // Platform selection changes
  platformSelect.addEventListener('change', () => {
    updatePlatformSettings();
  });

  multiPlatformSwitch.addEventListener('change', () => {
    updatePlatformSettings();
  });
  
  // Save settings
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newConfig = {
      streamKey: streamKeyInput.value,
      twitchStreamKey: twitchStreamKeyInput.value,
      facebookStreamKey: facebookStreamKeyInput.value,
      mediaDirectory: mediaDirectoryInput.value || './media',
      randomize: randomizeCheckbox.checked,
      loop: loopCheckbox.checked,
      platform: platformSelect.value,
      multiPlatform: multiPlatformSwitch.checked
    };
    
    try {
      const response = await fetch('/api/config/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newConfig)
      });
      
      const result = await response.json();
      
      if (result.success) {
        appState.config = result.config;
        updateUI();
        addLog('Settings saved successfully to database');
        
        // Show success message
        const successAlert = document.createElement('div');
        successAlert.className = 'alert alert-success alert-dismissible fade show';
        successAlert.innerHTML = `
          <i class="bi bi-check-circle-fill"></i> Configuration saved successfully!
          <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        settingsForm.insertBefore(successAlert, settingsForm.firstChild);
        
        // Auto-dismiss after 3 seconds
        setTimeout(() => {
          if (successAlert.parentNode) {
            successAlert.remove();
          }
        }, 3000);
        
      } else {
        addLog('Failed to save settings');
        showError(result.error || 'Failed to save settings');
      }
    } catch (error) {
      console.error('Error saving settings:', error);
      addLog(`Error saving settings: ${error.message}`);
      showError('Error saving settings');
    }
  });
  
  // Quick settings changes - save to database
  const saveQuickSetting = async (key, value) => {
    try {
      const response = await fetch('/api/config/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ [key]: value })
      });
      
      const result = await response.json();
      if (result.success) {
        appState.config = result.config;
      }
    } catch (error) {
      console.error('Error saving quick setting:', error);
    }
  };
  
  randomizeSwitch.addEventListener('change', async () => {
    const newValue = randomizeSwitch.checked;
    await saveQuickSetting('randomize', newValue);
    addLog(`Randomize media ${newValue ? 'enabled' : 'disabled'} (saved to database)`);
  });
  
  loopSwitch.addEventListener('change', async () => {
    const newValue = loopSwitch.checked;
    await saveQuickSetting('loop', newValue);
    addLog(`Loop playlist ${newValue ? 'enabled' : 'disabled'} (saved to database)`);
  });
  
  // Refresh media files
  refreshMediaBtn.addEventListener('click', () => {
    loadMediaFiles();
    addLog('Media files refreshed');
  });

  // Upload media files
  uploadMediaBtn.addEventListener('click', async () => {
    const file = mediaUploadInput.files[0];
    if (!file) {
      showError('Please select a media file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('mediaFile', file);

    try {
      const response = await fetch('/api/media/upload', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) {
        addLog(`Uploaded ${result.filename}`);
        mediaUploadInput.value = '';
        loadMediaFiles();
      } else {
        showError(result.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error uploading media:', error);
      showError('Error uploading media');
    }
  });
  
  // Clear logs
  clearLogsBtn.addEventListener('click', () => {
    appState.logs = [];
    logOutput.textContent = 'Logs cleared...';
    addLog('Logs cleared');
  });
  
  // Event listeners for buttons
  startBtn.addEventListener('click', startStreaming);
  stopBtn.addEventListener('click', stopStreaming);
  
  // Socket events
  socket.on('connect', () => {
    addLog('Connected to server');
  });
  
  socket.on('disconnect', () => {
    addLog('Disconnected from server');
  });
  
  socket.on('stream-status', (data) => {
    addLog(`Stream status: ${data.status} - ${data.message}`);
    
    if (data.status === 'streaming') {
      appState.isStreaming = true;
    } else if (data.status === 'stopped') {
      appState.isStreaming = false;
    }
    
    updateUI();
  });
  
  socket.on('stream-log', (message) => {
    addLog(message);
  });
  
  // Start analytics update timer
  setInterval(() => {
    if (appState.isStreaming) {
      updateAnalytics();
    }
  }, 5000);

  // Initialize app
  initialize();
}); 
