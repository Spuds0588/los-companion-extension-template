importScripts('../config/los-config.js');

// Allow Side Panel to open when the extension icon is clicked
chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(console.error);

const activeContexts = {}; // Local memory cache: TabID -> Context

// 1. SPA Navigation Hook
chrome.webNavigation.onHistoryStateUpdated.addListener((details) => {
    const context = LosConfig.parseContext(details.url);
    if (!context) return; // Not an entity page we track

    activeContexts[details.tabId] = context;

    console.log(`[LOS Background] Context updated for tab ${details.tabId}:`, context);

    // Broadcast to Content Script & Side Panel
    chrome.tabs.sendMessage(details.tabId, { type: 'LOS_CONTEXT_UPDATED', payload: context }).catch(() => null);
    chrome.runtime.sendMessage({ type: 'LOS_CONTEXT_UPDATED', payload: context }).catch(() => null);
});

// 2. Tab Switch -> Instant Heartbeat Request
chrome.tabs.onActivated.addListener(({ tabId }) => {
    console.log(`[LOS Background] Tab ${tabId} activated, forcing heartbeat.`);
    chrome.tabs.sendMessage(tabId, { type: 'FORCE_BEAT' }).catch(() => null);
});

// 3. Agnostic API Bus & Message Routing
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(`[LOS Background] Received message type: ${message.type}`, message.payload || '');

    if (message.type === 'ACTION_CLICKED') {
        console.log(`[LOS Background] Triggering external logic for: ${message.payload.buttonId}`);
        // TODO: Plug in custom Fetch/API logic here
    }
    else if (message.type === 'PRESENCE_HEARTBEAT') {
        exportPresenceData(message.payload);
    }
    else if (message.type === 'GET_CURRENT_CONTEXT') {
        // Bootstrap Side Panel on open
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            sendResponse(tabs[0] ? activeContexts[tabs[0].id] || null : null);
        });
        return true; // Keep message channel open for async response
    }
});

// 4. Data Egress Stub
function exportPresenceData(payload) {
    console.log('[LOS Background] Exporting Presence Data:', payload);
    // Developer: Add fetch() to external DB, CRM webhook, or Firebase here.
}
