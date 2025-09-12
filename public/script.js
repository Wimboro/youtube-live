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
  const clearLogsBtn = document.getElementById('clearLogsBtn');
  const settingsForm = document.getElementById('settingsForm');
  const themeToggle = document.getElementById('themeToggle');
  
  // Navigation
  const dashboardView = document.getElementById('dashboardView');
  const mediaView = document.getElementById('mediaView');
  const settingsView = document.getElementById('settingsView');
  const logsView = document.getElementById('logsView');
  const mediaBtn = document.getElementById('mediaBtn');
  const settingsBtn = document.getElementById('settingsBtn');
  const logsBtn = document.getElementById('logsBtn');
  const dashboardBtn = document.querySelector('[data-view="dashboardView"]');
  
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
  const showView = (view, activeLink) => {
    [dashboardView, mediaView, settingsView, logsView].forEach(v => v.classList.add('hidden'));
    view.classList.remove('hidden');

    document.querySelectorAll('.nav-link').forEach(link => {
      link.classList.remove('bg-gray-700');
    });

    if (activeLink) {
      activeLink.classList.add('bg-gray-700');
    }
  };

  // UI Navigation event listeners
  dashboardBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showView(dashboardView, dashboardBtn);
  });

  mediaBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showView(mediaView, mediaBtn);
    loadMediaFiles();
  });

  settingsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showView(settingsView, settingsBtn);
    loadSettings();
  });

  logsBtn.addEventListener('click', (e) => {
    e.preventDefault();
    showView(logsView, logsBtn);
  });

  // Set initial view
  showView(dashboardView, dashboardBtn);

  // Theme toggle
  const setTheme = (theme) => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      themeToggle.innerHTML = '<i class="bi bi-sun-fill"></i>';
    } else {
      document.documentElement.classList.remove('dark');
      themeToggle.innerHTML = '<i class="bi bi-moon-fill"></i>';
    }
    localStorage.setItem('theme', theme);
  };

  themeToggle.addEventListener('click', () => {
    const theme = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    setTheme(theme);
  });

  setTheme(localStorage.getItem('theme') || 'light');
  
  // Update UI based on current state
  const updateUI = () => {
    const { isStreaming, config, mediaFiles } = appState;
    
    // Update UI components based on streaming status
    if (isStreaming) {
      statusAlert.className = 'mb-4 p-4 rounded bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100';
      statusAlert.textContent = 'Status: Streaming';

      streamTitle.textContent = 'Streaming Active';
      streamStatus.textContent = 'The stream is currently running on YouTube.';

      const badge = streamIndicator.querySelector('span');
      const dot = streamIndicator.querySelector('div');
      badge.className = 'px-2 py-1 text-xs rounded bg-green-600 text-white mr-2';
      badge.textContent = 'Online';
      dot.className = 'w-3 h-3 rounded-full bg-green-600 animate-ping';

      startBtn.disabled = true;
      stopBtn.disabled = false;
    } else {
      statusAlert.className = 'mb-4 p-4 rounded bg-gray-200 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
      statusAlert.textContent = 'Status: Not streaming';

      streamTitle.textContent = 'Not Streaming';
      streamStatus.textContent = 'The stream is currently inactive.';

      const badge = streamIndicator.querySelector('span');
      const dot = streamIndicator.querySelector('div');
      badge.className = 'px-2 py-1 text-xs rounded bg-gray-500 text-white mr-2';
      badge.textContent = 'Offline';
      dot.className = 'w-3 h-3 rounded-full bg-gray-500';

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
    statusAlert.className = 'mb-4 p-4 rounded bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-100';
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
            <td class="px-2 py-1">${index + 1}</td>
            <td class="px-2 py-1">${file}</td>
            <td class="px-2 py-1">${fileExtension}</td>
            <td class="px-2 py-1"><span class="px-2 py-1 text-xs rounded bg-green-600 text-white">Ready</span></td>
          `;
          mediaTableBody.appendChild(row);
        });
      }
    } catch (error) {
      console.error('Error loading media files:', error);
      mediaTableBody.innerHTML = '<tr><td colspan="4" class="text-center text-red-600">Error loading media files</td></tr>';
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
        successAlert.className = 'mb-4 p-2 rounded bg-green-200 text-green-800 dark:bg-green-800 dark:text-green-100';
        successAlert.innerHTML = `<i class="bi bi-check-circle-fill"></i> Configuration saved successfully!`;
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