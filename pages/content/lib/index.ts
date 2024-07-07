import { toggleTheme } from '@lib/toggleTheme';

// const currentUrl = window.location.href;
// console.log('Current URL:', currentUrl); // Debugging line

// Send the URL to the background script
// chrome.runtime.sendMessage({ type: 'SCRAPE_URL', url: currentUrl }, response => {
//   if (response.error) {
//     console.error('Error from backend:', response.error);
//   } else {
//     console.log('Response from backend:', response);
//   }
// });

void toggleTheme();
