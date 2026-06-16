# 📊 Tracked Analytics Events Specification

The StellarTrust frontend integrates the PostHog JS SDK to log lifecycle actions. The following events are tracked on-chain and client-side:

---

## 🗂️ Event Registry

### 1. `wallet_connected`
*   **Trigger**: A user successfully connects a Stellar browser wallet.
*   **Properties Tracked**:
    ```json
    {
      "wallet_address": "G...",
      "event_type": "wallet_connected",
      "metadata": {
        "wallet_type": "freighter | albedo",
        "mode": "demo | live"
      }
    }
    ```

### 2. `profile_created`
*   **Trigger**: A user registers their identity profile on the protocol.
*   **Properties Tracked**:
    ```json
    {
      "wallet_address": "G...",
      "event_type": "profile_created",
      "metadata": {
        "username": "alice",
        "role": "client | freelancer | both"
      }
    }
    ```

### 3. `escrow_created`
*   **Trigger**: A client submits a new project agreement.
*   **Properties Tracked**:
    ```json
    {
      "wallet_address": "G...",
      "event_type": "escrow_created",
      "metadata": {
        "agreement_id": "1",
        "amount": 1500,
        "title": "Build Web3 App"
      }
    }
    ```

### 4. `escrow_funded`
*   **Trigger**: A client locks XLM tokens inside the Escrow contract.
*   **Properties Tracked**:
    ```json
    {
      "wallet_address": "G...",
      "event_type": "escrow_funded",
      "metadata": {
        "agreement_id": "1"
      }
    }
    ```

### 5. `milestone_completed`
*   **Trigger**: A milestone payment is released by the client.
*   **Properties Tracked**:
    ```json
    {
      "wallet_address": "G...",
      "event_type": "milestone_completed",
      "metadata": {
        "agreement_id": "1",
        "all_released": true,
        "current_status": "Released"
      }
    }
    ```

### 6. `reputation_updated`
*   **Trigger**: A review feedback entry is submitted for a completed project.
*   **Properties Tracked**:
    ```json
    {
      "wallet_address": "G...",
      "event_type": "reputation_updated",
      "metadata": {
        "agreement_id": "1",
        "rating": 5,
        "target": "G..."
      }
    }
    ```

### 7. `nft_minted`
*   **Trigger**: A freelancer mints their non-transferable completion badge NFT.
*   **Properties Tracked**:
    ```json
    {
      "wallet_address": "G...",
      "event_type": "nft_minted",
      "metadata": {
        "agreement_id": "1",
        "project_name": "Build Web3 App"
      }
    }
    ```
