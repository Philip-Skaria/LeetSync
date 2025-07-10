// Background service worker
chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'SUBMISSION_DETECTED') {
    console.log('Submission received:', message.data);
    // TODO: Handle GitHub sync
    handleSubmission(message.data);
  }
});

async function handleSubmission(data: any) {
  // Store submission data
  chrome.storage.local.set({
    [`submission_${data.timestamp}`]: data
  });
  
  console.log('Submission stored:', data);
}