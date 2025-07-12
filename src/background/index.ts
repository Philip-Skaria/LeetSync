// Background script for LeetSync extension
console.log('🔧 BACKGROUND SCRIPT LOADED!');

// Extension installation/update handler
chrome.runtime.onInstalled.addListener((details) => {
  console.log('📦 Extension installed/updated:', details.reason);
  
  if (details.reason === 'install') {
    console.log('🎉 LeetSync installed for the first time!');
  } else if (details.reason === 'update') {
    console.log('🔄 LeetSync updated to version:', chrome.runtime.getManifest().version);
  }
});

// Message handler for communication with content scripts
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
  console.log('📨 Message received in background:', request);
  
  switch (request.action) {
    case 'ping':
      sendResponse({ status: 'pong', timestamp: Date.now() });
      break;
    
    case 'sync-solution':
      // TODO: Implement GitHub sync logic
      console.log('🔄 Sync solution requested:', request.data);
      sendResponse({ status: 'success', message: 'Solution queued for sync' });
      break;
    
    default:
      console.log('❓ Unknown action:', request.action);
      sendResponse({ status: 'error', message: 'Unknown action' });
  }
});

// Keep service worker alive (for Manifest V3)
chrome.runtime.onConnect.addListener((port) => {
  console.log('🔌 Port connected:', port.name);
});

// Tab update listener (to detect LeetCode pages)
chrome.tabs.onUpdated.addListener((_tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url?.includes('leetcode.com')) {
    console.log('🎯 LeetCode page detected:', tab.url);
    // TODO: Inject content script or prepare for sync
  }
});

console.log('✅ Background script initialized successfully!');