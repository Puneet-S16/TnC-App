/**
 * content.js
 * Extracts text from the current page.
 */

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getPageText') {
        // Simple extraction. Could be improved to target specific containers if needed.
        // innerText is usually better than textContent for visible text.
        sendResponse({ text: document.body.innerText });
    }
    return true; // Keep the message channel open for async response
});
