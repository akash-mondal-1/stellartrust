#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String, Vec};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct UserProfile {
    pub wallet: Address,
    pub username: String,
    pub bio: String,
    pub skills: Vec<String>,
    pub verified: bool,
    pub created_at: u64,
}

#[contract]
pub struct IdentityContract;

#[contractimpl]
impl IdentityContract {
    // Register a profile
    pub fn register_user(env: Env, wallet: Address, username: String, bio: String, skills: Vec<String>) -> UserProfile {
        wallet.require_auth();
        
        let profile_key = wallet.clone();
        
        // Assert that the user is not already registered
        if env.storage().persistent().has(&profile_key) {
            panic!("User already registered");
        }
        
        let profile = UserProfile {
            wallet: wallet.clone(),
            username,
            bio,
            skills,
            verified: false,
            created_at: env.ledger().timestamp(),
        };
        
        env.storage().persistent().set(&profile_key, &profile);
        profile
    }

    // Update a profile
    pub fn update_profile(env: Env, wallet: Address, username: String, bio: String, skills: Vec<String>) -> UserProfile {
        wallet.require_auth();
        
        let profile_key = wallet.clone();
        
        // Check if user exists
        let mut profile: UserProfile = env.storage().persistent().get(&profile_key).unwrap_or_else(|| {
            panic!("Profile not found");
        });
        
        profile.username = username;
        profile.bio = bio;
        profile.skills = skills;
        
        env.storage().persistent().set(&profile_key, &profile);
        profile
    }

    // Initialize the contract by setting the admin address
    pub fn initialize(env: Env, admin: Address) {
        let admin_key = symbol_short!("admin");
        if env.storage().instance().has(&admin_key) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&admin_key, &admin);
    }

    // Verify a user (only admin / authorized identity contract authority can verify)
    pub fn verify_user(env: Env, wallet: Address, verifier: Address) -> UserProfile {
        verifier.require_auth();
        
        let admin_key = symbol_short!("admin");
        let admin: Address = env.storage().instance().get(&admin_key).unwrap_or_else(|| {
            panic!("Contract not initialized");
        });
        
        if admin != verifier {
            panic!("Only admin can verify users");
        }

        let profile_key = wallet.clone();
        let mut profile: UserProfile = env.storage().persistent().get(&profile_key).unwrap_or_else(|| {
            panic!("Profile not found");
        });
        
        profile.verified = true;
        env.storage().persistent().set(&profile_key, &profile);
        profile
    }

    // Get profile details
    pub fn get_profile(env: Env, wallet: Address) -> Option<UserProfile> {
        env.storage().persistent().get(&wallet)
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
    use soroban_sdk::{Env, String, Vec, Address};
    use soroban_sdk::testutils::Address as _;

    #[test]
    fn test_register_and_get() {
        let env = Env::default();
        let contract_id = env.register_contract(None, IdentityContract);
        let client = IdentityContractClient::new(&env, &contract_id);

        let user = Address::generate(&env);
        let admin = Address::generate(&env);
        env.mock_all_auths();

        // Initialize admin first
        client.initialize(&admin);

        let username = String::from_slice(&env, "alice");
        let bio = String::from_slice(&env, "Rust Developer");
        let mut skills = Vec::new(&env);
        skills.push_back(String::from_slice(&env, "rust"));

        let profile = client.register_user(&user, &username, &bio, &skills);
        assert_eq!(profile.username, username);
        assert_eq!(profile.verified, false);

        let resolved = client.get_profile(&user).unwrap();
        assert_eq!(resolved.username, username);
        
        // Verify user profile
        let verified_profile = client.verify_user(&user, &admin);
        assert_eq!(verified_profile.verified, true);
    }
}
