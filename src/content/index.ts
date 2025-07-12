// Type declaration for window extension
declare global {
  interface Window {
    testLeetSync: () => string;
  }
}

// Minimal content script for testing
console.log('🚀 CONTENT SCRIPT LOADED!');
console.log('Current URL:', window.location.href);
console.log('Chrome Runtime:', typeof chrome !== 'undefined' && chrome.runtime);

// Add visual indicator that script is loaded
const indicator = document.createElement('div');
indicator.style.cssText = `
  position: fixed;
  top: 10px;
  right: 10px;
  background: green;
  color: white;
  padding: 10px;
  border-radius: 5px;
  z-index: 9999;
  font-size: 12px;
  font-family: Arial, sans-serif;
  box-shadow: 0 2px 10px rgba(0,0,0,0.2);
`;
indicator.textContent = 'LeetSync Loaded!';
document.body.appendChild(indicator);

// Remove indicator after 3 seconds
setTimeout(() => {
  if (indicator && indicator.parentNode) {
    indicator.remove();
  }
}, 3000);

// Test function - simpler approach
console.log('🔧 Adding testLeetSync function to window...');

// Direct assignment without TypeScript interference
(window as any).testLeetSync = function() {
  console.log('✅ LeetSync test function called!');
  console.log('Extension status: Active');
  console.log('Current page:', document.title);
  console.log('URL:', window.location.href);
  
  // Check if we're on a problem page
  const isProblemPage = window.location.href.includes('/problems/');
  console.log('Is problem page:', isProblemPage);
  
  if (isProblemPage) {
    // Try to find problem title
    const titleElement = document.querySelector('h1, [data-cy="question-title"]');
    console.log('Problem title element:', titleElement?.textContent);
  }
  
  return {
    status: 'Extension is working!',
    page: document.title,
    url: window.location.href,
    isProblemPage: isProblemPage,
    timestamp: new Date().toISOString()
  };
};

// Verify function was added
if (typeof (window as any).testLeetSync === 'function') {
  console.log('✅ testLeetSync function successfully added to window');
  console.log('🧪 Test it with: window.testLeetSync()');
} else {
  console.error('❌ Failed to add testLeetSync function to window');
}

// Also add it to globalThis as backup
try {
  (globalThis as any).testLeetSync = (window as any).testLeetSync;
  console.log('✅ testLeetSync also added to globalThis');
} catch (e) {
  console.log('⚠️ Could not add to globalThis:', e);
}

// Additional debugging info
console.log('📊 Extension Debug Info:');
console.log('- Page title:', document.title);
console.log('- Document ready state:', document.readyState);
console.log('- User agent:', navigator.userAgent);
console.log('- Is LeetCode problem page:', window.location.href.includes('/problems/'));

// LeetCode page detection
if (window.location.href.includes('/problems/')) {
  console.log('🎯 LeetCode problem page detected!');
  
  // Wait for page to fully load, then try to detect elements
  setTimeout(() => {
    const problemTitle = document.querySelector('h1, [data-cy="question-title"]');
    const codeEditor = document.querySelector('[data-mode-id="python"], [data-mode-id="javascript"], .monaco-editor');
    
    console.log('🔍 Problem elements found:');
    console.log('- Title element:', problemTitle ? '✅ Found' : '❌ Not found');
    console.log('- Code editor:', codeEditor ? '✅ Found' : '❌ Not found');
    
    if (problemTitle) {
      console.log('- Problem title:', problemTitle.textContent?.trim());
    }
  }, 2000);
}

// Export empty object to make this a module (required for global declarations)
export {};