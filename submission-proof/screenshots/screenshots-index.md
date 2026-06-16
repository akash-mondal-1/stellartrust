# 📸 StellarTrust User Interface screenshots Index

This document catalogs the desktop and mobile user interface layouts captured by the Playwright end-to-end automation suite.

---

## 🖥️ Desktop screenshots (1280x800 Viewport)

| Page | Path / Route | Screenshot Link |
| :--- | :--- | :--- |
| **Landing Hero** | `/` | [View Desktop Landing Page](../../docs/screenshots/landing_desktop.png) |
| **User Dashboard** | `/dashboard` | [View Desktop Dashboard](../../docs/screenshots/dashboard_desktop.png) |
| **Escrow Contracts Manager** | `/escrow` | [View Desktop Escrow](../../docs/screenshots/escrow_desktop.png) |
| **Dynamic Reputation Scores** | `/reputation` | [View Desktop Reputation](../../docs/screenshots/reputation_desktop.png) |
| **Completion Badge NFT Gallery** | `/gallery` | [View Desktop NFT Gallery](../../docs/screenshots/gallery_desktop.png) |
| **Developer Sandbox Hub** | `/admin` | [View Desktop Admin](../../docs/screenshots/admin_desktop.png) |
| **Green Belt Validation Board** | `/admin/validation` | [View Desktop Analytics](../../docs/screenshots/analytics_desktop.png) |

---

## 📱 Mobile screenshots (375x812 Viewport)

| Page | Path / Route | Screenshot Link |
| :--- | :--- | :--- |
| **Landing Hero** | `/` | [View Mobile Landing Page](../../docs/screenshots/landing_mobile.png) |
| **User Dashboard** | `/dashboard` | [View Mobile Dashboard](../../docs/screenshots/dashboard_mobile.png) |
| **Escrow Contracts Manager** | `/escrow` | [View Mobile Escrow](../../docs/screenshots/escrow_mobile.png) |
| **Dynamic Reputation Scores** | `/reputation` | [View Mobile Reputation](../../docs/screenshots/reputation_mobile.png) |
| **Completion Badge NFT Gallery** | `/gallery` | [View Mobile NFT Gallery](../../docs/screenshots/gallery_mobile.png) |
| **Developer Sandbox Hub** | `/admin` | [View Mobile Admin](../../docs/screenshots/admin_mobile.png) |
| **Green Belt Validation Board** | `/admin/validation` | [View Mobile Analytics](../../docs/screenshots/analytics_mobile.png) |

---

## ⚙️ Automated Captures Script

These screenshots are generated automatically by starting the local testing web server and running the Playwright screenshots runner:

```bash
npm run test:screenshots --prefix apps/web
```

This guarantees UI responsiveness checks remain easily reproducible.
