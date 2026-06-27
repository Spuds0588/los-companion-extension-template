const els = { 
    context: document.getElementById('context-data'), 
    status: document.getElementById('status'), 
    tabs: document.querySelectorAll('.tab-btn'), 
    contents: document.querySelectorAll('.tab-content') 
};

// YAGNI Tab Switcher
els.tabs.forEach(t => t.onclick = () => {
    els.tabs.forEach(btn => btn.classList.toggle('active', btn === t));
    els.contents.forEach(content => content.classList.toggle('active', content.id === t.dataset.target));
});

const updateUI = (context) => {
    console.log('[LOS SidePanel] Updating UI with context:', context);
    if (context && context.entityId) {
        els.status.className = 'active-loan';
        els.status.textContent = `Active Entity: ${context.entityId} (${context.entityTab || 'Home'})`;
        els.context.textContent = JSON.stringify(context, null, 2);
    } else {
        els.status.className = 'waiting';
        els.status.textContent = 'Waiting for an LOS record page...';
        els.context.textContent = 'Navigate to a record to extract context.';
    }
};

// Bootstrap state on load (Important: catches state if opened after navigation)
chrome.runtime.sendMessage({ type: 'GET_CURRENT_CONTEXT' }, updateUI);

// Listen for live SPA route changes
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'LOS_CONTEXT_UPDATED') updateUI(msg.payload);
});
