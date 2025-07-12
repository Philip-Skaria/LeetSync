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

// Test function
window.testLeetSync = () => {
  console.log('✅ LeetSync test function called!');
  console.log('Extension status: Active');
  console.log('Current page:', document.title);
  return 'Extension is working!';
};

// Additional debugging info
console.log('📊 Extension Debug Info:');
console.log('- Page title:', document.title);
console.log('- Document ready state:', document.readyState);
console.log('- User agent:', navigator.userAgent);

// Export empty object to make this a module (required for global declarations)
export {};