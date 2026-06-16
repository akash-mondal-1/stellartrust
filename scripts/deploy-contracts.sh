#!/usr/bin/env bash

# deploy-contracts.sh
# Compiles and deploys StellarTrust Soroban smart contracts to Stellar Testnet

set -euo pipefail

# Configurations
NETWORK="testnet"
RPC_URL="https://soroban-testnet.stellar.org:443"
NETWORK_PASSPHRASE="Test Stellar Network ; September 2015"
DEPLOYER_KEY_NAME="stellartrust-deployer"

echo "=== StellarTrust Soroban Deployment Tool ==="

# 1. Check for Stellar CLI
if ! command -v stellar &> /dev/null; then
    echo "ERROR: 'stellar' CLI is not installed."
    echo "Please install it by running: cargo install --locked stellar-cli"
    exit 1
fi

# 2. Check or Generate Deployer Key
echo "Checking deployer account: $DEPLOYER_KEY_NAME"
if ! stellar keys address "$DEPLOYER_KEY_NAME" &> /dev/null; then
    echo "No key found. Generating new deployer key: $DEPLOYER_KEY_NAME"
    stellar keys generate "$DEPLOYER_KEY_NAME" --network "$NETWORK"
else
    echo "Deployer key found."
fi

DEPLOYER_ADDR=$(stellar keys address "$DEPLOYER_KEY_NAME")
echo "Deployer Address: $DEPLOYER_ADDR"

# 3. Fund Deployer Account if needed via Friendbot
echo "Checking balance and requesting Friendbot test funds..."
curl -s "https://friendbot.stellar.org?addr=$DEPLOYER_ADDR" > /dev/null || true

# 4. Compile Contracts to WebAssembly (WASM)
echo "Compiling smart contracts..."
cargo build --target wasm32-unknown-unknown --release --manifest-path contracts/Cargo.toml

# WASM build output paths
WASM_DIR="contracts/target/wasm32-unknown-unknown/release"
# If a custom target directory was configured in local cargo configs, respect it:
if [ ! -d "$WASM_DIR" ]; then
    WASM_DIR="contracts/target_no_inc/wasm32-unknown-unknown/release"
fi

# 5. Deploy Contracts
deploy_contract() {
    local name=$1
    local wasm_path="$WASM_DIR/$name.wasm"
    
    if [ ! -f "$wasm_path" ]; then
        # Check standard name mapping (hyphens vs underscores)
        wasm_path="$WASM_DIR/$(echo "$name" | tr '_' '-').wasm"
    fi
    
    echo "Deploying contract: $name from $wasm_path..."
    local contract_id
    contract_id=$(stellar contract deploy \
        --wasm "$wasm_path" \
        --source "$DEPLOYER_KEY_NAME" \
        --network "$NETWORK")
    echo "$name Contract ID: $contract_id"
    echo "$contract_id"
}

echo "=== Starting On-Chain Deployments ==="

IDENTITY_ID=$(deploy_contract "stellartrust_identity")
ESCROW_ID=$(deploy_contract "stellartrust_escrow")
REPUTATION_ID=$(deploy_contract "stellartrust_reputation")
NFT_ID=$(deploy_contract "stellartrust_nft")

# 6. Save Deployment Results to File
DEPLOYMENT_ENV="apps/web/.env.deployed"
echo "Saving contract addresses to $DEPLOYMENT_ENV..."
cat << EOF > "$DEPLOYMENT_ENV"
# StellarTrust Deployed Contracts addresses
NEXT_PUBLIC_IDENTITY_CONTRACT=$IDENTITY_ID
NEXT_PUBLIC_ESCROW_CONTRACT=$ESCROW_ID
NEXT_PUBLIC_REPUTATION_CONTRACT=$REPUTATION_ID
NEXT_PUBLIC_NFT_CONTRACT=$NFT_ID
EOF

echo "=== Deployed Successfully! ==="
echo "Identity ID:    $IDENTITY_ID"
echo "Escrow ID:      $ESCROW_ID"
echo "Reputation ID:  $REPUTATION_ID"
echo "NFT ID:         $NFT_ID"
echo "Deployment environments saved to $DEPLOYMENT_ENV"
