# 🛡️ Monitoring & Error Tracking Notes

This document provides technical details on how Sentry is integrated into StellarTrust to track client-side runtime errors.

---

## 🛠️ Architecture
1.  **SDK Package**: `@sentry/nextjs`
2.  **Implementation**:
    *   Sentry intercepts all unhandled React component exceptions, API query failures, and runtime library crashes.
    *   Custom integration warnings thrown in Live Network Mode (e.g., when the wallet builder notifies the user that transaction writing requires full SDK envelope implementations) are tracked as caught errors to audit user paths.
3.  **Client Configuration**:
    Configured via `NEXT_PUBLIC_SENTRY_DSN` in environmental properties. It filters out local hot-reload console warnings and focuses on capturing fatal runtime exceptions.

---

## 🔍 Diagnostics Workflow
When an issue is reported by a tester:
1.  Navigate to the Sentry **Issues Stream** tab.
2.  Filter by project name and env tag (e.g., `production`).
3.  Examine the **Breadcrumbs** feed in Sentry, which details the user's sequential clicks and page redirects prior to the exception occurring.
4.  Trace the lines of code back through the uploaded Webpack source maps.
