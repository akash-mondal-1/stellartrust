# ⛓️ Smart Contract Addresses (Stellar Testnet)

The following Stellar Soroban smart contracts are actively deployed on the **Stellar Testnet** and verified with the latest security hardening fixes.

---

## 📋 Deployed Contract Catalog

| Contract Component | Deployed Contract ID | Explorer Lookup Link |
| :--- | :--- | :--- |
| **Identity Registry** | `CBAJHSDO3F6LIQPB7OTT4HPYJIE3EPH2ZKTSVBS3QB7IQ7CONI644REP` | [Stellar.Expert Profile](https://stellar.expert/explorer/testnet/contract/CBAJHSDO3F6LIQPB7OTT4HPYJIE3EPH2ZKTSVBS3QB7IQ7CONI644REP) |
| **Escrow Manager** | `CC5IPJJYJTHSANTIX2RR6BZZ4OY7RDCZLPLMZIVEMIBTYAUYGVCSHIJJ` | [Stellar.Expert Profile](https://stellar.expert/explorer/testnet/contract/CC5IPJJYJTHSANTIX2RR6BZZ4OY7RDCZLPLMZIVEMIBTYAUYGVCSHIJJ) |
| **Reputation Engine** | `CBGEGODHEMTZTIOVO7L66RRTAKEMAGYCXEM37BVZFT4ZCUGQYHEOZFD6` | [Stellar.Expert Profile](https://stellar.expert/explorer/testnet/contract/CBGEGODHEMTZTIOVO7L66RRTAKEMAGYCXEM37BVZFT4ZCUGQYHEOZFD6) |
| **Achievement NFT Certs** | `CDOBVROTIXHQWRZBFYTBJICIZ2BITWPFTN5RTXO3J7NUBX3TUPX33FWU` | [Stellar.Expert Profile](https://stellar.expert/explorer/testnet/contract/CDOBVROTIXHQWRZBFYTBJICIZ2BITWPFTN5RTXO3J7NUBX3TUPX33FWU) |

---

## 🛠️ Verification Command Reference
You can verify the active status and methods exposed by these contract instances directly from your terminal using the Stellar CLI:

```bash
# Verify Identity Registry
stellar contract id spec --id CBAJHSDO3F6LIQPB7OTT4HPYJIE3EPH2ZKTSVBS3QB7IQ7CONI644REP --network testnet

# Verify Escrow Manager
stellar contract id spec --id CC5IPJJYJTHSANTIX2RR6BZZ4OY7RDCZLPLMZIVEMIBTYAUYGVCSHIJJ --network testnet

# Verify Reputation Engine
stellar contract id spec --id CBGEGODHEMTZTIOVO7L66RRTAKEMAGYCXEM37BVZFT4ZCUGQYHEOZFD6 --network testnet

# Verify Achievement NFT Certs
stellar contract id spec --id CDOBVROTIXHQWRZBFYTBJICIZ2BITWPFTN5RTXO3J7NUBX3TUPX33FWU --network testnet
```
