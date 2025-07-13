// src/background/index.ts
console.log('LeetSync: Background script loaded');

chrome.runtime.onInstalled.addListener(() => {
  console.log('LeetSync: Extension installed');
});