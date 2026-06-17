#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct NFTMetadata {
    pub token_id: u32,
    pub freelancer: Address,
    pub agreement_id: String,
    pub project_name: String,
    pub project_hash: String,
    pub completion_date: u64,
}

#[contract]
pub struct AchievementNFTContract;

#[contractimpl]
impl AchievementNFTContract {
    // Initialize the contract by setting the admin address
    pub fn initialize(env: Env, admin: Address) {
        let admin_key = symbol_short!("admin");
        if env.storage().instance().has(&admin_key) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&admin_key, &admin);
    }

    // Mint a project completion certificate
    pub fn mint_project_nft(
        env: Env,
        freelancer: Address,
        agreement_id: String,
        project_name: String,
        project_hash: String,
        authority: Address,
    ) -> u32 {
        authority.require_auth();

        // Verify admin/authority
        let admin_key = symbol_short!("admin");
        let admin: Address = env.storage().instance().get(&admin_key).unwrap_or_else(|| {
            panic!("Contract not initialized");
        });
        if admin != authority {
            panic!("Only admin can mint project completion certificates");
        }

        // Get and increment next token ID
        let token_id_key = symbol_short!("next_id");
        let next_id: u32 = env.storage().instance().get(&token_id_key).unwrap_or(1);
        env.storage().instance().set(&token_id_key, &(next_id + 1));

        let metadata = NFTMetadata {
            token_id: next_id,
            freelancer: freelancer.clone(),
            agreement_id,
            project_name,
            project_hash,
            completion_date: env.ledger().timestamp(),
        };

        // Store NFT Metadata
        env.storage().persistent().set(&next_id, &metadata);

        // Store user balance of NFTs (just a collection listing)
        let user_collection_key = (freelancer.clone(), next_id);
        env.storage().persistent().set(&user_collection_key, &true);

        // Emit event
        env.events().publish(
            (symbol_short!("nft_mint"), freelancer, next_id),
            next_id,
        );

        next_id
    }

    // Get certificate details
    pub fn get_project_certificate(env: Env, token_id: u32) -> Option<NFTMetadata> {
        env.storage().persistent().get(&token_id)
    }

    // Set contract admin
    pub fn set_admin(env: Env, _admin: Address, new_admin: Address) {
        let admin_key = symbol_short!("admin");
        let current_admin: Address = env.storage().instance().get(&admin_key).unwrap_or_else(|| {
            panic!("Contract not initialized");
        });
        current_admin.require_auth();
        env.storage().instance().set(&admin_key, &new_admin);
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{Env, String, Address};
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_mint_nft() {
        let env = Env::default();
        let contract_id = env.register_contract(None, AchievementNFTContract);
        let client = AchievementNFTContractClient::new(&env, &contract_id);

        let freelancer = Address::generate(&env);
        let admin = Address::generate(&env);
        env.mock_all_auths();

        // Initialize contract first
        client.initialize(&admin);

        let agreement_id = String::from_slice(&env, "project-123");
        let project_name = String::from_slice(&env, "Web3 App");
        let project_hash = String::from_slice(&env, "hash-123");

        let token_id = client.mint_project_nft(
            &freelancer,
            &agreement_id,
            &project_name,
            &project_hash,
            &admin,
        );

        assert_eq!(token_id, 1);

        let cert = client.get_project_certificate(&1).unwrap();
        assert_eq!(cert.freelancer, freelancer);
        assert_eq!(cert.project_name, project_name);
    }
}
