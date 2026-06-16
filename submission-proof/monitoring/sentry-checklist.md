# 🛡️ Sentry Monitoring Checklist

This checklist verifies the initialization and reporting functionality of Sentry error logging inside the StellarTrust web client.

---

## ⚙️ Sentry Setup Verification
- [ ] Verify `NEXT_PUBLIC_SENTRY_DSN` is correctly configured in your deployment environment.
- [ ] Confirm Sentry properties files (`sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`) exist in the project root of the web app if utilizing full framework tracking.
- [ ] Verify that nextjs Sentry webpack plugin builds successfully during `npm run build` production checks.

---

## 💥 Runtime Error Reporting Verification
To test error logging and trace exceptions:
- [ ] Navigate to the **Settings** or profile screen in the browser.
- [ ] Simulate a wallet rejection or force a runtime error (e.g., attempt to call on-chain transactions in live network mode, which throws a controlled `Error` exception).
- [ ] Open the Browser console and confirm that Sentry captures the event (you can filter networks for `sentry.io/api` POST requests).
- [ ] Access the [Sentry Console](https://sentry.io) under your configured project.
- [ ] Open the **Issues** stream and confirm that the thrown error is listed with its stack trace pointing back to the line of execution.
- [ ] Inspect the tags of the issue to verify it includes browser metadata, OS version, and page URL.
