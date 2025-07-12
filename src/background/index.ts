// Enhanced background service worker
console.log('LeetSync background script loaded');

interface SubmissionData {
  problemTitle: string;
  problemSlug: string;
  code: string;
  language: string;
  status: string;
  timestamp: number;
  difficulty: string;
  url: string;
}

// Handle messages from content script
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SUBMISSION_DETECTED') {
    console.log('📥 Submission received:', message.data);
    handleSubmission(message.data)
      .then(() => {
        sendResponse({ success: true });
      })
      .catch((error) => {
        console.error('❌ Error handling submission:', error);
        sendResponse({ success: false, error: error.message });
      });
    
    return true; // Keep message channel open for async response
  }
});

async function handleSubmission(submissionData: SubmissionData) {
  try {
    // Store submission in Chrome storage
    await storeSubmission(submissionData);
    
    // Check if auto-sync is enabled
    const settings = await chrome.storage.local.get(['autoSync', 'githubConfig']);
    
    if (settings.autoSync && settings.githubConfig?.isConnected) {
      console.log('🔄 Auto-sync enabled, pushing to GitHub...');
      await syncToGitHub(submissionData, settings.githubConfig);
    } else {
      console.log('📝 Submission stored locally. Auto-sync disabled or GitHub not connected.');
    }
    
    // Show badge with pending submissions count
    await updateBadge();
    
  } catch (error) {
    console.error('Error handling submission:', error);
    throw error;
  }
}

async function storeSubmission(submissionData: SubmissionData) {
  try {
    // Get existing submissions
    const result = await chrome.storage.local.get(['submissions']);
    const submissions = result.submissions || [];
    
    // Add new submission to the beginning
    submissions.unshift(submissionData);
    
    // Keep only last 100 submissions to prevent storage bloat
    if (submissions.length > 100) {
      submissions.splice(100);
    }
    
    // Store back
    await chrome.storage.local.set({ submissions });
    
    console.log('✅ Submission stored locally');
  } catch (error) {
    console.error('Error storing submission:', error);
    throw error;
  }
}

async function syncToGitHub(submissionData: SubmissionData, githubConfig: any) {
  try {
    // TODO: Implement GitHub API integration
    console.log('🚀 Syncing to GitHub...', {
      problem: submissionData.problemTitle,
      repo: githubConfig.repositoryName
    });
    
    // For now, just simulate the sync
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('✅ Successfully synced to GitHub');
  } catch (error) {
    console.error('Error syncing to GitHub:', error);
    throw error;
  }
}

async function updateBadge() {
  try {
    const result = await chrome.storage.local.get(['submissions', 'githubConfig']);
    const submissions = result.submissions || [];
    const githubConfig = result.githubConfig || {};
    
    // Count unsynced submissions
    const unsyncedCount = githubConfig.isConnected ? 0 : submissions.length;
    
    if (unsyncedCount > 0) {
      chrome.action.setBadgeText({ text: unsyncedCount.toString() });
      chrome.action.setBadgeBackgroundColor({ color: '#ef4444' });
    } else {
      chrome.action.setBadgeText({ text: '' });
    }
  } catch (error) {
    console.error('Error updating badge:', error);
  }
}

// Initialize badge on startup
chrome.runtime.onStartup.addListener(() => {
  updateBadge();
});

// Update badge when extension is installed/enabled
chrome.runtime.onInstalled.addListener(() => {
  updateBadge();
});