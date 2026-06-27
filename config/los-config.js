// LOS Global Configuration Map
//
// PLATFORM-AGNOSTIC: This template ships with NO hardcoded LOS domains.
// To target your LOS, fill in `domains` and `urlPattern` below.
//
// `domains` controls WHERE the extension activates. Add every host your LOS
// can run on (production, sandbox, custom subdomains).
//
// `urlPattern` controls WHAT gets extracted. It must define named capture
// groups so parseContext() can build a context object:
//   entityId  -> the primary record identifier (e.g. loan/deal/file ID)
//   entityTab -> the active tab/view inside that record (optional)
// Rename the groups to match your LOS's vocabulary if you like, then update
// the keys in parseContext() accordingly.
const LosConfig = {
    // Hostnames (without protocol) where this extension should activate.
    domains: ['your-los.example.com'],

    // Named-group regex applied to page URLs to extract the active context.
    // Default expects the common pattern: /loan/<id>/<tab>
    urlPattern: /\/loan\/(?<entityId>[^\/?#]+)\/?(?<entityTab>[^\/?#]+)?/,

    // Declarative UI Array - Add buttons here and they auto-inject when the
    // current context's tab matches `tabRegex`.
    customFABs: [
        {
            id: 'sync-crm',
            label: 'Sync to CRM',
            css: 'bottom: 20px; right: 20px; background: #007bff; color: white;',
            tabRegex: /.*/
        },
        {
            id: 'start-video',
            label: 'Start Video Room',
            css: 'bottom: 70px; right: 20px; background: #28a745; color: white;',
            tabRegex: /Borrower_Information/i
        }
    ],

    // Helper: build match pattern list for manifest injection at build time.
    manifestPatterns: () => LosConfig.domains.map(d => `*://*.${d}/*`),

    // Helper: extract named regex groups from a URL, or null if no match.
    parseContext: (url) => url.match(LosConfig.urlPattern)?.groups || null
};

// Unified export compatibility: browser (content script) and Node (tests/tooling)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LosConfig;
} else {
    window.LosConfig = LosConfig;
}
