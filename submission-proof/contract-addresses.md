# ⛓️ Smart Contract Addresses (Stellar Testnet)

The following Stellar Soroban smart contracts are actively deployed on the **Stellar Testnet** and verified with the latest security hardening fixes.

---

## 📋 Deployed Contract Catalog

| Contract Component | Deployed Contract ID | Explorer Lookup Link |
| :--- | :--- | :--- |
| **Identity Registry** | `CBQX65GOQO2AH3GI7DJSGM6EBBHE3VSFISFH6WRRET2WRCNWVBBQ4IKR` | [Stellar.Expert Profile](https://stellar.expert/explorer/testnet/contract/CBQX65GOQO2AH3GI7DJSGM6EBBHE3VSFISFH6WRRET2WRCNWVBBQ4IKR) |
| **Escrow Manager** | `CCG6O2K7ZV6HDGAVEOTDCIFMIQIUFMRWGABGW2J7QXJKVGHFEIEAU4BU` | [Stellar.Expert Profile](https://stellar.expert/explorer/testnet/contract/CCG6O2K7ZV6HDGAVEOTDCIFMIQIUFMRWGABGW2J7QXJKVGHFEIEAU4BU) |
| **Reputation Engine** | `CBCJUI7GX2RDG6KHBEEFDIHJTW4EQ2XQHCOPL655C6ICOZSDQVAZFLXD` | [Stellar.Expert Profile](https://stellar.expert/explorer/testnet/contract/CBCJUI7GX2RDG6KHBEEFDIHJTW4EQ2XQHCOPL655C6ICOZSDQVAZFLXD) |
| **Achievement NFT Certs** | `CD5ZTDUAGSHYXFOPRQAWFRS2D3CAPCX7J23UXNLLOU5FU34WHKAFZOBK` | [Stellar.Expert Profile](https://stellar.expert/explorer/testnet/contract/CD5ZTDUAGSHYXFOPRQAWFRS2D3CAPCX7J23UXNLLOU5FU34WHKAFZOBK) |

---

## 🛠️ Verification Command Reference
You can verify the active status and methods exposed by these contract instances directly from your terminal using the Stellar CLI:

```bash
# Verify Identity Registry
stellar contract id spec --id CBQX65GOQO2AH3GI7DJSGM6EBBHE3VSFISFH6WRRET2WRCNWVBBQ4IKR --network testnet

# Verify Escrow Manager
stellar contract id spec --id CCG6O2K7ZV6HDGAVEOTDCIFMIQIUFMRWGABGW2J7QXJKVGHFEIEAU4BU --network testnet

# Verify Reputation Engine
stellar contract id spec --id CBCJUI7GX2RDG6KHBEEFDIHJTW4EQ2XQHCOPL655C6ICOZSDQVAZFLXD --network testnet

# Verify Achievement NFT Certs
stellar contract id spec --id CD5ZTDUAGSHYXFOPRQAWFRS2D3CAPCX7J23UXNLLOU5FU34WHKAFZOBK --network testnet
```
