# ⚙️ Production Environment Variables Checklist

This checklist registers all critical environment variables required to run the StellarTrust production application on platforms like Vercel.

---

## 🗂️ Environment Checklist

- [ ] **NEXT_PUBLIC_STELLAR_NETWORK**: Must be set to `testnet`.
- [ ] **NEXT_PUBLIC_SUPABASE_URL**: URL endpoint of the production Supabase database.
- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Anonymous public client key for accessing the Supabase REST interface.
- [ ] **NEXT_PUBLIC_IDENTITY_CONTRACT**: Deployed Identity Contract ID:
  `CBQX65GOQO2AH3GI7DJSGM6EBBHE3VSFISFH6WRRET2WRCNWVBBQ4IKR`
- [ ] **NEXT_PUBLIC_ESCROW_CONTRACT**: Deployed Escrow Contract ID:
  `CCG6O2K7ZV6HDGAVEOTDCIFMIQIUFMRWGABGW2J7QXJKVGHFEIEAU4BU`
- [ ] **NEXT_PUBLIC_REPUTATION_CONTRACT**: Deployed Reputation Contract ID:
  `CBCJUI7GX2RDG6KHBEEFDIHJTW4EQ2XQHCOPL655C6ICOZSDQVAZFLXD`
- [ ] **NEXT_PUBLIC_NFT_CONTRACT**: Deployed Achievement NFT Contract ID:
  `CD5ZTDUAGSHYXFOPRQAWFRS2D3CAPCX7J23UXNLLOU5FU34WHKAFZOBK`
- [ ] **NEXT_PUBLIC_POSTHOG_KEY**: PostHog API token for event capture tracking.
- [ ] **NEXT_PUBLIC_POSTHOG_HOST**: PostHog telemetry URL endpoint (typically `https://app.posthog.com`).
- [ ] **NEXT_PUBLIC_SENTRY_DSN**: Sentry credentials DSN string for reporting UI and Server crashes.
