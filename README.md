# LOS Companion Extension Template

> **🌐 Live landing page:** [spuds0588.github.io/los-companion-extension-template](https://spuds0588.github.io/los-companion-extension-template/) — quick overview, FAQ, and a ready-to-use AI-agent prompt for customizing this template.

A lightweight, modular Chrome Extension template designed to act as a starting point for integrating **any web-based Loan Origination System (LOS)** — or any web app with URL-addressable records — with external tools (CRMs, communication platforms, tracking databases).

## Why this exists

Most web LOS platforms are Single Page Applications and lack accessible front-end APIs. This template circumvents those limitations with a stable, Vanilla JS scaffolding that relies on standard Chrome APIs, URL parsing, LocalStorage extraction, and Shadow DOM UI injection — with **zero hardcoded platform specifics**. Point it at your LOS's domain and URL structure and it works.

## Core Features
- **Context Extraction Engine:** Parses any configured URL pattern and `localStorage` to identify the active user, record ID, and current tab/view.
- **Declarative UI Overlays (Shadow DOM):** Easily configure floating action buttons (FABs) or modals that mount over the host app without CSS bleed from the host framework.
- **Reactive Side Panel:** A dependency-free side panel that stays perfectly synced with the user's navigation state.
- **Presence & Heartbeat Tracker:** Granular time-tracking system to monitor active workflows, automatically handling split screens and rapid tab switching.
- **Agnostic API Bus:** Pre-built background message routers ready for you to plug in your custom `fetch()` logic.

## Project Structure
```text
├── config/
│   └── los-config.js        # Declarative setup: Domains, URL pattern, UI definitions
├── background/
│   └── background.js        # Service Worker: Router, Heartbeat Aggregator, Fetch logic
├── content/
│   └── content.js           # Content Script: Shadow DOM Injection, visibilityState polling
├── sidepanel/
│   ├── sidepanel.html       # Vanilla UI Framework
│   ├── sidepanel.css        # Styling
│   └── sidepanel.js         # Reactive UI State Management
├── DEPLOYMENT.md            # Enterprise force-install instructions
├── manifest.json            # MV3 Manifest
└── README.md
```

## Adapting the Template to Your LOS

Two changes make this template work with any web-based LOS. Both live in `config/los-config.js` (plus a matching edit in `manifest.json`):

### 1. Target your LOS's domains

```javascript
// config/los-config.js
domains: ['your-los.example.com'],
```

Then update `manifest.json` so Chrome injects the content script and grants host permissions on those hosts:

```json
"host_permissions": ["*://*.your-los.example.com/*"],
"content_scripts": [{ "matches": ["*://*.your-los.example.com/*"], ... }]
```

### 2. Match your LOS's URL structure

The context engine extracts whatever named capture groups you define:

```javascript
// Default: /loan/<id>/<tab>
urlPattern: /\/loan\/(?<entityId>[^\/?#]+)\/?(?<entityTab>[^\/?#]+)?/,
```

- `entityId` — the primary record identifier (loan, deal, file, contact, etc.)
- `entityTab` — the active tab/view inside that record (optional)

Rename the groups to match your LOS's vocabulary if you prefer — just keep `parseContext()` and the UI consumers in agreement.

### 3. Define your overlays

```javascript
customFABs: [
    {
        id: 'sync-crm',
        label: 'Sync to CRM',
        css: 'bottom: 20px; right: 20px; background: #007bff; color: white;',
        tabRegex: /.*/                    // all views
    },
    {
        id: 'start-video',
        label: 'Start Video Room',
        css: 'bottom: 70px; right: 20px; background: #28a745; color: white;',
        tabRegex: /Borrower_Information/i // specific view only
    }
]
```

## Message Contract

All internal messaging is platform-agnostic:

| Message | Direction | Purpose |
|---|---|---|
| `LOS_CONTEXT_UPDATED` | Background → Content/Side Panel | Broadcasts parsed context |
| `FORCE_BEAT` | Background → Content | Requests immediate heartbeat |
| `PRESENCE_HEARTBEAT` | Content → Background | Presence telemetry payload |
| `ACTION_CLICKED` | Content → Background | FAB interaction hook |
| `GET_CURRENT_CONTEXT` | Side Panel → Background | Bootstrap on panel open |
