import 'webextension-polyfill';
import { exampleThemeStorage } from '@chrome-extension-boilerplate/storage';

exampleThemeStorage.get().then(theme => {
  console.log('theme', theme);
});

console.log('background loaded');
chrome.runtime.onInstalled.addListener(() => {
  console.log('Extension installed');
});

// chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
//   if (message.type === 'SCRAPE_URL') {
//     try {
//       console.log('Scraping URL:', message.url);
//       const response = await fetch('http://localhost:8000/scrape_and_prompt', {
//         method: 'POST',
//         headers: {
//           'Content-Type': 'application/json',
//         },
//         body: JSON.stringify({ url: message.url }),
//       });
//       const data = await response.json();
//       console.log(data);
//       sendResponse({ status: 'success', content: data });
//     } catch (error) {
//       const errorMessage = (error as Error).message || 'Unknown error';
//       sendResponse({ status: 'error', message: errorMessage });
//     }
//   }
//   return true; // Indicates that the response will be sent asynchronously
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'SCRAPE_URL') {
    fetch('http://localhost:8000/scrape_and_prompt', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: message.url }),
    })
      .then(response => response.json())
      .then(data => {
        sendResponse({
          status: 'success',
          matches: data.matches,
          openai_response: data.openai_response,
        });
      })
      .catch(error => {
        console.error('Error:', error);
        sendResponse({
          status: 'error',
          message: 'Failed to fetch data from backend',
        });
      });
    return true; // Keeps the message channel open for async response
  }
});
