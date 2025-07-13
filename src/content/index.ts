// src/content/index.ts - Simple test version

console.log('=== LEETSYNC CONTENT SCRIPT LOADED ===');

// Add test function to window
window.testLeetSync = () => {
  console.log('✅ Manual LeetSync working!', {
    status: 'Working manually!',
    page: document.title,
    url: window.location.href,
    timestamp: new Date().toISOString()
  });
  
  // Show simple notification
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    background: #10b981;
    color: white;
    border-radius: 8px;
    font-family: system-ui, -apple-system, sans-serif;
    font-size: 14px;
    font-weight: 500;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    z-index: 10000;
  `;
  notification.textContent = 'LeetSync is working!';
  document.body.appendChild(notification);
  
  setTimeout(() => notification.remove(), 3000);
};

console.log('=== LEETSYNC FUNCTION DEFINED ===');
console.log('Type: window.testLeetSync =', typeof window.testLeetSync);
function detectProblem() {
  if (window.location.pathname.includes('/problems/')) {
    const titleElement = document.querySelector('h1') || 
                        document.querySelector('[data-cy="question-title"]');
    
    if (titleElement) {
      const title = titleElement.textContent?.trim() || 'Unknown Problem';
      console.log('🎯 Problem detected:', title);
      return title;
    }
  }
  return null;
}

// Run detection on load
setTimeout(() => {
  const problem = detectProblem();
  if (problem) {
    console.log('Auto-detected problem:', problem);
  }
}, 2000);

console.log('LeetSync: Ready! Use window.testLeetSync() to test');