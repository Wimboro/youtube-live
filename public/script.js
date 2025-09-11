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
  const mediaDirectoryInput = document.getElementById('mediaDirectoryInput');
  const randomizeCheckbox = document.getElementById('randomizeCheckbox');
  const loopCheckbox = document.getElementById('loopCheckbox');
  const randomizeSwitch = document.getElementById('randomizeSwitch');
  const loopSwitch = document.getElementById('loopSwitch');
  const toggleStreamKey = document.getElementById('toggleStreamKey');
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
  const mediaBtn = document.getElementById('mediaBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const logsBtn = document.getElementById('logsBtn');
  
  // Socket.io connection
  const socket = io();
  
  // App state
  let appState = {
    isStreaming: false,
    config: {
      streamKey: '',
      mediaDirectory: './media',
      randomize: true,
      loop: true
    },
    mediaFiles: [],
    logs: []
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
      document.querySelector('.nav-link:first-child').classList.add('active');
    }
  };
  
  // UI Navigation event listeners
  mediaBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showView(mediaView);
    mediaBtn.classList.add('active');
    loadMediaFiles();
  });
  
  settingsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showView(settingsView);
    settingsBtn.classList.add('active');
    loadSettings();
  });
  
  logsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showView(logsView);
    logsBtn.classList.add('active');
  });
  
  // Update UI based on current state
  const updateUI = () => {
    const { isStreaming, config, mediaFiles } = appState;
    
    // Update UI components based on streaming status
    if (isStreaming) {
      statusAlert.classList.remove('alert-secondary', 'alert-danger');
      statusAlert.classList.add('alert-success');
      statusAlert.textContent = 'Status: Streaming';
      
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
      statusAlert.textContent = 'Status: Not streaming';
      
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
        mediaTableBody.innerHTML = '<tr><td colspan="4" class="text-center">No media files found</td></tr>';
      } else {
        mediaTableBody.innerHTML = '';
        appState.mediaFiles.forEach((file, index) => {
          const fileExtension = file.split('.').pop().toLowerCase();
          const row = document.createElement('tr');
          row.innerHTML = `
            <td>${index + 1}</td>
            <td>${file}</td>
            <td>${fileExtension}</td>
            <td><span class="badge bg-success">Ready</span></td>
          `;
          mediaTableBody.appendChild(row);
        });
      }
    } catch (error) {
      console.error('Error loading media files:', error);
      mediaTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-danger">Error loading media files</td></tr>';
    }
  };
  
  // Load settings
  const loadSettings = () => {
    const { config } = appState;
    
    streamKeyInput.value = config.streamKey || '';
    mediaDirectoryInput.value = config.mediaDirectory || './media';
    randomizeCheckbox.checked = config.randomize;
    loopCheckbox.checked = config.loop;
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
  
  // Save settings
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const newConfig = {
      streamKey: streamKeyInput.value,
      mediaDirectory: mediaDirectoryInput.value || './media',
      randomize: randomizeCheckbox.checked,
      loop: loopCheckbox.checked
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
  
  // Initialize app
  initialize();
}); 