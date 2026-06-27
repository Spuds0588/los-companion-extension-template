console.log('[LOS Content] Initializing content script...');

let currentContext = LosConfig.parseContext(window.location.href);

// 1. Shadow DOM Setup (Appended to body for maximum stability against SPA frameworks)
const rootWrapper = document.createElement('div');
rootWrapper.id = 'los-companion-root';
document.body.appendChild(rootWrapper);
const shadow = rootWrapper.attachShadow({ mode: 'open' });

// 2. Declarative Rendering Engine
const renderFABs = (context) => {
    shadow.innerHTML = ''; // Fast reset
    if (!context) return;

    LosConfig.customFABs.forEach(fab => {
        if (!fab.tabRegex.test(context.entityTab || '')) return;
        
        const btn = document.createElement('button');
        btn.textContent = fab.label;
        btn.style.cssText = `position: fixed; z-index: 2147483647; padding: 10px 15px; border-radius: 8px; border: none; cursor: pointer; font-family: sans-serif; box-shadow: 0 4px 6px rgba(0,0,0,0.1); transition: opacity 0.2s; ${fab.css}`;
        btn.onmouseover = () => btn.style.opacity = '0.8';
        btn.onmouseout = () => btn.style.opacity = '1';
        
        btn.onclick = () => chrome.runtime.sendMessage({ 
            type: "ACTION_CLICKED", 
            payload: { buttonId: fab.id, context } 
        });
        
        shadow.appendChild(btn);
    });
};

// 3. Local Storage Extractor (One-liner map/reduce with auto JSON parsing)
const getUserData = () => Object.keys(localStorage).reduce((acc, key) => key.toLowerCase().includes('user') ? { ...acc, [key]: (()=>{try{return JSON.parse(localStorage[key])}catch{return localStorage[key]}})() } : acc, {});

// 4. Presence Engine
const emitHeartbeat = () => {
    const state = document.visibilityState === 'visible' ? 'BEAT_ACTIVE' : 'BEAT_IDLE';
    console.log(`[LOS Content] Emitting heartbeat: ${state}`);
    chrome.runtime.sendMessage({ 
        type: 'PRESENCE_HEARTBEAT', 
        payload: { state, timestamp: Date.now(), context: currentContext, user: getUserData() } 
    });
};
setInterval(emitHeartbeat, 30000); // 30-second interval

// Listen for Context Updates from Background
chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'LOS_CONTEXT_UPDATED') {
        currentContext = msg.payload;
        renderFABs(currentContext);
    } else if (msg.type === 'FORCE_BEAT') {
        emitHeartbeat();
    }
});

// Bootstrap
renderFABs(currentContext);
emitHeartbeat();
