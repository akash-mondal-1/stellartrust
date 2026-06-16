#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, String};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ReputationInfo {
    pub completed_projects: u32,
    pub rating_sum: u32,
    pub rating_count: u32,
    pub disputes_lost: u32,
    pub trust_score: u32,
}

#[contract]
pub struct ReputationContract;

#[contractimpl]
impl ReputationContract {
    // Initialize the contract by setting the admin address
    pub fn initialize(env: Env, admin: Address) {
        let admin_key = symbol_short!("admin");
        if env.storage().instance().has(&admin_key) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&admin_key, &admin);
    }

    // Add a review after a project is finished
    pub fn add_review(
        env: Env,
        agreement_id: String,
        reviewer: Address,
        reviewee: Address,
        rating: u32,
        comment: String,
    ) -> ReputationInfo {
        reviewer.require_auth();
        
        if rating < 1 || rating > 5 {
            panic!("Rating must be between 1 and 5");
        }

        // Prevent double review for the same agreement by the same reviewer
        let review_check_key = (agreement_id.clone(), reviewer.clone());
        if env.storage().persistent().has(&review_check_key) {
            panic!("Review already submitted for this agreement");
        }
        env.storage().persistent().set(&review_check_key, &true);

        // Get or initialize reviewee reputation
        let rep_key = reviewee.clone();
        let mut rep: ReputationInfo = env.storage().persistent().get(&rep_key).unwrap_or(ReputationInfo {
            completed_projects: 0,
            rating_sum: 0,
            rating_count: 0,
            disputes_lost: 0,
            trust_score: 50,
        });

        // Update rating stats
        rep.rating_sum += rating;
        rep.rating_count += 1;
        rep.completed_projects += 1;

        // Calculate trust score:
        // Base score = 50. Plus 2 per completed project. Plus 5 per avg rating point. Minus 10 per lost dispute.
        // Scale average rating calculation to prevent early truncation
        let scaled_avg = (rep.rating_sum * 5) / rep.rating_count;
        let mut score = 50 + (rep.completed_projects * 2) + scaled_avg;
        let penalty = rep.disputes_lost * 10;
        
        if score > penalty {
            score -= penalty;
        } else {
            score = 0;
        }
        
        if score > 100 {
            score = 100;
        }
        rep.trust_score = score;

        // Save reputation
        env.storage().persistent().set(&rep_key, &rep);

        // Emit an event for indexers
        env.events().publish(
            (symbol_short!("review"), reviewee, reviewer),
            (rating, agreement_id, comment),
        );

        rep
    }

    // Update disputes lost and recalculate score
    pub fn record_dispute_lost(env: Env, user: Address, authority: Address) -> ReputationInfo {
        authority.require_auth();
        
        let admin_key = symbol_short!("admin");
        let admin: Address = env.storage().instance().get(&admin_key).unwrap_or_else(|| {
            panic!("Contract not initialized");
        });
        if admin != authority {
            panic!("Only admin can record dispute penalties");
        }

        let rep_key = user.clone();
        let mut rep: ReputationInfo = env.storage().persistent().get(&rep_key).unwrap_or(ReputationInfo {
            completed_projects: 0,
            rating_sum: 0,
            rating_count: 0,
            disputes_lost: 0,
            trust_score: 50,
        });

        rep.disputes_lost += 1;

        // Recalculate trust score scale
        let scaled_avg = if rep.rating_count > 0 {
            (rep.rating_sum * 5) / rep.rating_count
        } else {
            0
        };
        let mut score = 50 + (rep.completed_projects * 2) + scaled_avg;
        let penalty = rep.disputes_lost * 10;
        if score > penalty {
            score -= penalty;
        } else {
            score = 0;
        }
        if score > 100 {
            score = 100;
        }
        rep.trust_score = score;

        env.storage().persistent().set(&rep_key, &rep);
        rep
    }

    // Get reputation info for a user
    pub fn get_reputation(env: Env, user: Address) -> ReputationInfo {
        env.storage().persistent().get(&user).unwrap_or(ReputationInfo {
            completed_projects: 0,
            rating_sum: 0,
            rating_count: 0,
            disputes_lost: 0,
            trust_score: 50,
        })
    }

    // Set contract admin
    pub fn set_admin(env: Env, admin: Address, new_admin: Address) {
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

    #[test]
    fn test_reviews_and_score() {
        let env = Env::default();
        let contract_id = env.register_contract(None, ReputationContract);
        let client = ReputationContractClient::new(&env, &contract_id);

        let reviewer = Address::generate(&env);
        let reviewee = Address::generate(&env);
        let admin = Address::generate(&env);
        env.mock_all_auths();

        // Initialize contract first
        client.initialize(&admin);

        let agreement_id = String::from_slice(&env, "project-1");
        let comment = String::from_slice(&env, "Excellent developer!");

        let rep = client.add_review(&agreement_id, &reviewer, &reviewee, &5, &comment);
        assert_eq!(rep.rating_count, 1);
        assert_eq!(rep.completed_projects, 1);
        assert_eq!(rep.trust_score, 77); // 50 + 2 + 25 = 77

        let resolved = client.get_reputation(&reviewee);
        assert_eq!(resolved.trust_score, 77);
    }
}
