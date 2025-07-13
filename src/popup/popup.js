// popup/popup.js
// State management
let isConnected = false;
let currentConfig = {
    token: '',
    repo: '',
    folderPath: 'leetcode-solutions/',
    autoSync: true,
    includeDescription: true,
    organizeByCifficulty: false
};

// DOM elements
const elements = {
    status: document.getElementById('status'),
    statusText: document.getElementById('statusText'),
    authSection: document.getElementById('authSection'),
    configSection: document.getElementById('configSection'),
    githubToken: document.getElementById('githubToken'),
    connectBtn: document.getElementById('connectBtn'),
    repoSelect: document.getElementById('repoSelect'),
    folderPath: document.getElementById('folderPath'),
    saveConfigBtn: document.getElementById('saveConfigBtn'),
    disconnectBtn: document.getElementById('disconnectBtn'),
    loading: document.getElementById('loading'),
    autoSyncToggle: document.getElementById('autoSyncToggle'),
    includeDescToggle: document.getElementById('includeDescToggle'),
    organizeDiffToggle: document.getElementById('organizeDiffToggle')
};

// Initialize popup
document.addEventListener('DOMContentLoaded', async () => {
    await loadConfiguration();
    setupEventListeners();
});

// Load saved configuration using Chrome Storage API
async function loadConfiguration() {
    try {
        const result = await chrome.storage.sync.get(['leetsync-config']);
        if (result['leetsync-config']) {
            currentConfig = { ...currentConfig, ...result['leetsync-config'] };
            if (currentConfig.token) {
                await validateAndConnect();
            }
        }
        updateUI();
    } catch (error) {
        console.error('Failed to load configuration:', error);
    }
}

// Save configuration using Chrome Storage API
async function saveConfiguration() {
    try {
        await chrome.storage.sync.set({ 'leetsync-config': currentConfig });
    } catch (error) {
        console.error('Failed to save configuration:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    elements.connectBtn.addEventListener('click', handleConnect);
    elements.disconnectBtn.addEventListener('click', handleDisconnect);
    elements.saveConfigBtn.addEventListener('click', handleSaveConfig);
    
    // Toggle switches
    elements.autoSyncToggle.addEventListener('click', () => toggleSetting('autoSync'));
    elements.includeDescToggle.addEventListener('click', () => toggleSetting('includeDescription'));
    elements.organizeDiffToggle.addEventListener('click', () => toggleSetting('organizeByCifficulty'));
}

// Handle GitHub connection
async function handleConnect() {
    const token = elements.githubToken.value.trim();
    if (!token) {
        showMessage('Please enter your GitHub token', 'error');
        return;
    }

    showLoading(true);
    try {
        const isValid = await validateGitHubToken(token);
        if (isValid) {
            currentConfig.token = token;
            await loadRepositories();
            isConnected = true;
            await saveConfiguration();
            updateUI();
            showMessage('Successfully connected to GitHub!', 'success');
        } else {
            showMessage('Invalid GitHub token. Please check and try again.', 'error');
        }
    } catch (error) {
        showMessage('Failed to connect to GitHub. Please try again.', 'error');
        console.error('Connection error:', error);
    } finally {
        showLoading(false);
    }
}

// Validate GitHub token
async function validateGitHubToken(token) {
    try {
        const response = await fetch('https://api.github.com/user', {
            headers: {
                'Authorization': `token ${token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        return response.ok;
    } catch (error) {
        return false;
    }
}

// Load user repositories
async function loadRepositories() {
    try {
        const response = await fetch('https://api.github.com/user/repos?per_page=100&sort=updated', {
            headers: {
                'Authorization': `token ${currentConfig.token}`,
                'Accept': 'application/vnd.github.v3+json'
            }
        });
        
        if (response.ok) {
            const repos = await response.json();
            populateRepositorySelect(repos);
        }
    } catch (error) {
        console.error('Failed to load repositories:', error);
    }
}

// Populate repository dropdown
function populateRepositorySelect(repos) {
    elements.repoSelect.innerHTML = '<option value="">Choose a repository...</option>';
    repos.forEach(repo => {
        const option = document.createElement('option');
        option.value = repo.full_name;
        option.textContent = `${repo.full_name} ${repo.private ? '(Private)' : '(Public)'}`;
        elements.repoSelect.appendChild(option);
    });
    
    if (currentConfig.repo) {
        elements.repoSelect.value = currentConfig.repo;
    }
}

// Handle configuration save
async function handleSaveConfig() {
    const selectedRepo = elements.repoSelect.value;
    const folderPath = elements.folderPath.value.trim();
    
    if (!selectedRepo) {
        showMessage('Please select a repository', 'error');
        return;
    }

    currentConfig.repo = selectedRepo;
    currentConfig.folderPath = folderPath;
    
    await saveConfiguration();
    showMessage('Configuration saved successfully!', 'success');
    
    // Notify content script about updated config
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab && tab.url.includes('leetcode.com')) {
            chrome.tabs.sendMessage(tab.id, {
                action: 'CONFIG_UPDATED',
                config: currentConfig
            });
        }
    } catch (error) {
        console.error('Failed to notify content script:', error);
    }
}

// Handle disconnect
async function handleDisconnect() {
    isConnected = false;
    currentConfig.token = '';
    currentConfig.repo = '';
    elements.githubToken.value = '';
    await saveConfiguration();
    updateUI();
    showMessage('Disconnected from GitHub', 'info');
}

// Validate and connect on startup
async function validateAndConnect() {
    if (currentConfig.token) {
        const isValid = await validateGitHubToken(currentConfig.token);
        if (isValid) {
            isConnected = true;
            await loadRepositories();
        } else {
            currentConfig.token = '';
            await saveConfiguration();
        }
    }
}

// Toggle setting
async function toggleSetting(setting) {
    currentConfig[setting] = !currentConfig[setting];
    updateUI();
    await saveConfiguration();
}

// Update UI based on state
function updateUI() {
    // Update connection status
    if (isConnected) {
        elements.status.className = 'status connected';
        elements.statusText.textContent = 'Connected to GitHub';
        elements.authSection.classList.add('hidden');
        elements.configSection.classList.remove('hidden');
        elements.configSection.classList.add('fade-in');
    } else {
        elements.status.className = 'status disconnected';
        elements.statusText.textContent = 'Not connected to GitHub';
        elements.authSection.classList.remove('hidden');
        elements.configSection.classList.add('hidden');
    }

    // Update form values
    elements.folderPath.value = currentConfig.folderPath;
    
    // Update toggles
    elements.autoSyncToggle.className = currentConfig.autoSync ? 'toggle active' : 'toggle';
    elements.includeDescToggle.className = currentConfig.includeDescription ? 'toggle active' : 'toggle';
    elements.organizeDiffToggle.className = currentConfig.organizeByCifficulty ? 'toggle active' : 'toggle';
}

// Show/hide loading indicator
function showLoading(show) {
    elements.loading.style.display = show ? 'block' : 'none';
    elements.connectBtn.disabled = show;
}

// Show message to user
function showMessage(message, type = 'info') {
    // Create or update message element
    let messageEl = document.getElementById('message');
    if (!messageEl) {
        messageEl = document.createElement('div');
        messageEl.id = 'message';
        messageEl.style.cssText = `
            position: fixed;
            top: 10px;
            left: 50%;
            transform: translateX(-50%);
            padding: 8px 16px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 500;
            z-index: 1000;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(messageEl);
    }
    
    // Set message style based on type
    const styles = {
        success: { background: '#4caf50', color: 'white' },
        error: { background: '#f44336', color: 'white' },
        info: { background: '#2196f3', color: 'white' }
    };
    
    const style = styles[type] || styles.info;
    messageEl.style.background = style.background;
    messageEl.style.color = style.color;
    messageEl.textContent = message;
    messageEl.style.display = 'block';
    
    // Auto-hide after 3 seconds
    setTimeout(() => {
        if (messageEl) {
            messageEl.style.display = 'none';
        }
    }, 3000);
}