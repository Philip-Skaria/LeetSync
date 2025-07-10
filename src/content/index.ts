// Enhanced LeetCode content script
console.log('LeetSync content script loaded');

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

let lastSubmissionTime = 0;
const SUBMISSION_COOLDOWN = 5000; // 5 seconds to prevent duplicates

// Function to extract problem information
function extractProblemInfo(): Partial<SubmissionData> {
  const problemTitle = document.querySelector('[data-cy="question-title"]')?.textContent?.trim() || 
                      document.querySelector('h1')?.textContent?.trim() || 
                      'Unknown Problem';
  
  const problemSlug = window.location.pathname.split('/')[2] || 'unknown-problem';
  
  const difficultyElement = document.querySelector('[data-degree]') || 
                           document.querySelector('.text-difficulty-easy, .text-difficulty-medium, .text-difficulty-hard');
  const difficulty = difficultyElement?.textContent?.trim() || 'Unknown';
  
  return {
    problemTitle,
    problemSlug,
    difficulty,
    url: window.location.href
  };
}

// Function to extract code from Monaco editor
function extractCode(): { code: string; language: string } {
  // Try to get code from Monaco editor
  const monacoEditor = document.querySelector('.monaco-editor textarea');
  if (monacoEditor) {
    const code = (monacoEditor as HTMLTextAreaElement).value;
    
    // Try to detect language from the dropdown
    const languageSelect = document.querySelector('[data-cy="lang-select"]') as HTMLSelectElement;
    const language = languageSelect?.value || 'unknown';
    
    return { code, language };
  }
  
  // Fallback: try to find code in other elements
  const codeElements = document.querySelectorAll('.monaco-editor .view-lines');
  let code = '';
  codeElements.forEach(el => {
    code += el.textContent || '';
  });
  
  return { 
    code: code || 'Code extraction failed', 
    language: 'unknown' 
  };
}

// Function to detect successful submission
function detectSubmission() {
  const now = Date.now();
  
  // Prevent duplicate detections
  if (now - lastSubmissionTime < SUBMISSION_COOLDOWN) {
    return;
  }
  
  // Look for success indicators
  const successSelectors = [
    '[data-e2e-locator="console-result"]',
    '.text-green-s',
    '.text-success',
    '[data-testid="result-success"]'
  ];
  
  let isAccepted = false;
  
  for (const selector of successSelectors) {
    const elements = document.querySelectorAll(selector);
    elements.forEach(element => {
      const text = element.textContent?.toLowerCase() || '';
      if (text.includes('accepted') || text.includes('success')) {
        isAccepted = true;
      }
    });
  }
  
  // Also check for the green checkmark or success status
  const statusElements = document.querySelectorAll('[data-icon="check"], .text-green-s');
  if (statusElements.length > 0) {
    isAccepted = true;
  }
  
  if (isAccepted) {
    console.log('✅ Successful submission detected!');
    lastSubmissionTime = now;
    extractAndSendSubmission();
  }
}

// Function to extract all submission data and send to background
function extractAndSendSubmission() {
  const problemInfo = extractProblemInfo();
  const codeInfo = extractCode();
  
  const submissionData: SubmissionData = {
    problemTitle: problemInfo.problemTitle || 'Unknown Problem',
    problemSlug: problemInfo.problemSlug || 'unknown-problem',
    code: codeInfo.code,
    language: codeInfo.language,
    status: 'accepted',
    timestamp: Date.now(),
    difficulty: problemInfo.difficulty || 'Unknown',
    url: problemInfo.url || window.location.href
  };
  
  console.log('📤 Sending submission data:', submissionData);
  
  // Send to background script
  chrome.runtime.sendMessage({
    type: 'SUBMISSION_DETECTED',
    data: submissionData
  }, (response) => {
    if (response?.success) {
      console.log('✅ Submission successfully processed');
      showNotification('Submission synced to GitHub!');
    } else {
      console.error('❌ Failed to process submission:', response?.error);
      showNotification('Failed to sync submission', 'error');
    }
  });
}

// Function to show notification to user
function showNotification(message: string, type: 'success' | 'error' = 'success') {
  // Create notification element
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 8px;
    color: white;
    font-weight: bold;
    z-index: 10000;
    transition: opacity 0.3s ease;
    background-color: ${type === 'success' ? '#10b981' : '#ef4444'};
  `;
  notification.textContent = `🔄 LeetSync: ${message}`;
  
  document.body.appendChild(notification);
  
  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.style.opacity = '0';
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Enhanced observer to watch for submission results
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList') {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Check if this is a result element
          if (element.matches('[data-e2e-locator="console-result"]') ||
              element.querySelector('[data-e2e-locator="console-result"]')) {
            setTimeout(detectSubmission, 1000); // Small delay to ensure DOM is ready
          }
        }
      });
    }
  });
});

// Start observing
observer.observe(document.body, { 
  childList: true, 
  subtree: true 
});

// Also run detection on page load (in case user refreshes after submission)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    setTimeout(detectSubmission, 2000);
  });
} else {
  setTimeout(detectSubmission, 2000);
}