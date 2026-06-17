# ⚙️ Production Environment Variables Checklist

This checklist registers all critical environment variables required to run the StellarTrust production application on platforms like Vercel.

---

## 🗂️ Environment Checklist

- [ ] **NEXT_PUBLIC_STELLAR_NETWORK**: Must be set to `testnet`.
- [ ] **NEXT_PUBLIC_SUPABASE_URL**: URL endpoint of the production Supabase database.
- [ ] **NEXT_PUBLIC_SUPABASE_ANON_KEY**: Anonymous public client key for accessing the Supabase REST interface.
- [ ] **NEXT_PUBLIC_IDENTITY_CONTRACT**: Deployed Identity Contract ID:
  `CBAJHSDO3F6LIQPB7OTT4HPYJIE3EPH2ZKTSVBS3QB7IQ7CONI644REP`
- [ ] **NEXT_PUBLIC_ESCROW_CONTRACT**: Deployed Escrow Contract ID:
  `CC5IPJJYJTHSANTIX2RR6BZZ4OY7RDCZLPLMZIVEMIBTYAUYGVCSHIJJ`
- [ ] **NEXT_PUBLIC_REPUTATION_CONTRACT**: Deployed Reputation Contract ID:
  `CBGEGODHEMTZTIOVO7L66RRTAKEMAGYCXEM37BVZFT4ZCUGQYHEOZFD6`
- [ ] **NEXT_PUBLIC_NFT_CONTRACT**: Deployed Achievement NFT Contract ID:
  `CDOBVROTIXHQWRZBFYTBJICIZ2BITWPFTN5RTXO3J7NUBX3TUPX33FWU`
- [ ] **NEXT_PUBLIC_POSTHOG_KEY**: PostHog API token for event capture tracking.
- [ ] **NEXT_PUBLIC_POSTHOG_HOST**: PostHog telemetry URL endpoint (typically `https://app.posthog.com`).
- [ ] **NEXT_PUBLIC_SENTRY_DSN**: Sentry credentials DSN string for reporting UI and Server crashes.
