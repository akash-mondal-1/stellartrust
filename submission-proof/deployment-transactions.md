# 📝 Deployment Transactions evidence

This document outlines the transaction workflows and explorer paths verifying the on-chain creation of the StellarTrust smart contracts on the Stellar Testnet.

---

## 🔑 Deployer Profile
*   **Deployer Account Key Name**: `stellartrust-deployer`
*   **Network**: Testnet (`Test Stellar Network ; September 2015`)
*   **RPC Endpoint**: `https://soroban-testnet.stellar.org:443`

All contracts were compiled to optimized WebAssembly WASM targets and uploaded using the `stellar contract deploy` command, which executes two distinct operations on-chain:
1.  **WASM Upload**: Submits the compiled binary to the ledger, returning a WASM hash.
2.  **Contract Instantiation**: Spawns the Contract ID bound to the WASM hash.

---

## ⛓️ Transaction Verification References

To inspect deployment transactions, query Stellar.Expert or the Stellar Laboratory with the following contract IDs and transaction hashes:

### 1. Identity Registry Contract
*   **Contract ID**: `CBAJHSDO3F6LIQPB7OTT4HPYJIE3EPH2ZKTSVBS3QB7IQ7CONI644REP`
*   **Instantiation Tx Hash (Placeholder)**: `[Run verify-deploy script or inspect deployer address transactions on explorer]`
*   **Explorer Link**: [Identity Contract Profile](https://stellar.expert/explorer/testnet/contract/CBAJHSDO3F6LIQPB7OTT4HPYJIE3EPH2ZKTSVBS3QB7IQ7CONI644REP)

### 2. Escrow Manager Contract
*   **Contract ID**: `CC5IPJJYJTHSANTIX2RR6BZZ4OY7RDCZLPLMZIVEMIBTYAUYGVCSHIJJ`
*   **Instantiation Tx Hash (Placeholder)**: `[Run verify-deploy script or inspect deployer address transactions on explorer]`
*   **Explorer Link**: [Escrow Contract Profile](https://stellar.expert/explorer/testnet/contract/CC5IPJJYJTHSANTIX2RR6BZZ4OY7RDCZLPLMZIVEMIBTYAUYGVCSHIJJ)

### 3. Reputation Engine Contract
*   **Contract ID**: `CBGEGODHEMTZTIOVO7L66RRTAKEMAGYCXEM37BVZFT4ZCUGQYHEOZFD6`
*   **Instantiation Tx Hash (Placeholder)**: `[Run verify-deploy script or inspect deployer address transactions on explorer]`
*   **Explorer Link**: [Reputation Contract Profile](https://stellar.expert/explorer/testnet/contract/CBGEGODHEMTZTIOVO7L66RRTAKEMAGYCXEM37BVZFT4ZCUGQYHEOZFD6)

### 4. Achievement NFT Certs Contract
*   **Contract ID**: `CDOBVROTIXHQWRZBFYTBJICIZ2BITWPFTN5RTXO3J7NUBX3TUPX33FWU`
*   **Instantiation Tx Hash (Placeholder)**: `[Run verify-deploy script or inspect deployer address transactions on explorer]`
*   **Explorer Link**: [NFT Contract Profile](https://stellar.expert/explorer/testnet/contract/CDOBVROTIXHQWRZBFYTBJICIZ2BITWPFTN5RTXO3J7NUBX3TUPX33FWU)

---

## 🔍 How to Retrieve Real-Time Tx Hashes
To fetch the exact transaction hashes of the deployments:
1.  Run the Stellar CLI command to get the history of the deployer address (substituting the deployer address generated during local setup):
    ```bash
    # Retrieve the deployer address
    stellar keys address stellartrust-deployer
    ```
2.  Navigate to `https://stellar.expert/explorer/testnet/account/<DEPLOYER_ADDRESS>` to view the chronological record of transactions including the `Upload Wasm` and `Create Contract` operations.
