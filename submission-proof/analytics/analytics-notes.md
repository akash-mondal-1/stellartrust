# 📝 PostHog Integration Technical Notes

This document provides context on how the analytics system is implemented and how to verify its events dashboard.

---

## 🛠️ Architecture
The analytics framework is implemented under `apps/web/src/lib/analytics.ts` and hooks directly into the React lifecycle:
1.  **SDK Package**: `posthog-js`
2.  **Tracking Wrapper**:
    ```typescript
    import posthog from 'posthog-js';

    export const trackEvent = ({ wallet_address, event_type, metadata = {} }) => {
      if (typeof window !== 'undefined') {
        posthog.capture(event_type, {
          wallet_address,
          ...metadata
        });
      }
    };
    ```
3.  **Telemetry Flow**:
    *   During local development or static builds, events fall back to terminal log prints if the key is missing.
    *   In production deployments (like Vercel), the events are routed directly to the cloud dashboard configured via `NEXT_PUBLIC_POSTHOG_KEY`.

---

## 📊 PostHog Dashboard Verification Guide
To set up and review user actions in the PostHog dashboard:
1.  Log in to your [PostHog Console](https://app.posthog.com).
2.  Navigate to **Project Settings** -> **Data Pipeline** to confirm event ingress.
3.  Go to the **Live Events** tab on the left sidebar.
4.  Perform actions in the app (e.g., connect wallet, fund escrow) and watch for instant event appearance.
5.  Click on any individual event to expand the JSON body and confirm properties match the schema detailed in `analytics-events.md`.
