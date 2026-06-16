#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, token, Address, Env};

#[contracttype]
#[derive(Clone, Copy, Debug, Eq, PartialEq)]
#[repr(u32)]
pub enum AgreementStatus {
    Created = 0,
    Funded = 1,
    Accepted = 2,
    Submitted = 3,
    Approved = 4,
    Released = 5,
    Disputed = 6,
    Cancelled = 7,
}

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct Agreement {
    pub id: u32,
    pub client: Address,
    pub freelancer: Address,
    pub amount: i128,
    pub token: Address,
    pub deadline: u64,
    pub status: AgreementStatus,
    pub milestone_count: u32,
    pub current_milestone: u32,
    pub funded_amount: i128,
}

#[contract]
pub struct EscrowContract;

#[contractimpl]
impl EscrowContract {
    // Create work agreement
    pub fn create_agreement(
        env: Env,
        client: Address,
        freelancer: Address,
        amount: i128,
        token: Address,
        deadline: u64,
        milestone_count: u32,
    ) -> u32 {
        client.require_auth();

        let id_key = symbol_short!("next_id");
        let next_id: u32 = env.storage().instance().get(&id_key).unwrap_or(1);
        env.storage().instance().set(&id_key, &(next_id + 1));

        let agreement = Agreement {
            id: next_id,
            client,
            freelancer,
            amount,
            token,
            deadline,
            status: AgreementStatus::Created,
            milestone_count,
            current_milestone: 0,
            funded_amount: 0,
        };

        env.storage().persistent().set(&next_id, &agreement);

        env.events().publish(
            (symbol_short!("created"), next_id),
            (next_id, amount),
        );

        next_id
    }

    // Fund the escrow
    pub fn fund_escrow(env: Env, agreement_id: u32, client: Address) -> Agreement {
        client.require_auth();

        let mut agreement: Agreement = env
            .storage()
            .persistent()
            .get(&agreement_id)
            .unwrap_or_else(|| panic!("Agreement not found"));

        if agreement.client != client {
            panic!("Only the client can fund this escrow");
        }
        if agreement.status != AgreementStatus::Created {
            panic!("Escrow is already funded or in progress");
        }

        // Transfer tokens from client to the escrow contract
        let token_client = token::Client::new(&env, &agreement.token);
        token_client.transfer(&client, &env.current_contract_address(), &agreement.amount);

        agreement.funded_amount = agreement.amount;
        agreement.status = AgreementStatus::Funded;

        env.storage().persistent().set(&agreement_id, &agreement);

        env.events().publish(
            (symbol_short!("funded"), agreement_id),
            agreement.amount,
        );

        agreement
    }

    // Freelancer accepts project
    pub fn accept_agreement(env: Env, agreement_id: u32, freelancer: Address) -> Agreement {
        freelancer.require_auth();

        let mut agreement: Agreement = env
            .storage()
            .persistent()
            .get(&agreement_id)
            .unwrap_or_else(|| panic!("Agreement not found"));

        if agreement.freelancer != freelancer {
            panic!("Only the assigned freelancer can accept");
        }
        if agreement.status != AgreementStatus::Funded {
            panic!("Agreement must be funded before acceptance");
        }

        agreement.status = AgreementStatus::Accepted;
        env.storage().persistent().set(&agreement_id, &agreement);

        env.events().publish((symbol_short!("accepted"), agreement_id), freelancer);

        agreement
    }

    // Freelancer submits work for current milestone
    pub fn submit_work(env: Env, agreement_id: u32, freelancer: Address) -> Agreement {
        freelancer.require_auth();

        let mut agreement: Agreement = env
            .storage()
            .persistent()
            .get(&agreement_id)
            .unwrap_or_else(|| panic!("Agreement not found"));

        if agreement.freelancer != freelancer {
            panic!("Only the freelancer can submit work");
        }
        if agreement.status != AgreementStatus::Accepted
            && agreement.status != AgreementStatus::Approved
        {
            panic!("Invalid status for work submission");
        }

        agreement.status = AgreementStatus::Submitted;
        env.storage().persistent().set(&agreement_id, &agreement);

        env.events().publish(
            (symbol_short!("submitted"), agreement_id),
            agreement.current_milestone,
        );

        agreement
    }

    // Client approves work for current milestone
    pub fn approve_work(env: Env, agreement_id: u32, client: Address) -> Agreement {
        client.require_auth();

        let mut agreement: Agreement = env
            .storage()
            .persistent()
            .get(&agreement_id)
            .unwrap_or_else(|| panic!("Agreement not found"));

        if agreement.client != client {
            panic!("Only the client can approve work");
        }
        if agreement.status != AgreementStatus::Submitted {
            panic!("No work submitted for approval");
        }

        agreement.status = AgreementStatus::Approved;
        env.storage().persistent().set(&agreement_id, &agreement);

        env.events().publish(
            (symbol_short!("approved"), agreement_id),
            agreement.current_milestone,
        );

        agreement
    }

    // Release payment for current milestone
    pub fn release_payment(env: Env, agreement_id: u32, client: Address) -> Agreement {
        client.require_auth();

        let mut agreement: Agreement = env
            .storage()
            .persistent()
            .get(&agreement_id)
            .unwrap_or_else(|| panic!("Agreement not found"));

        if agreement.client != client {
            panic!("Only the client can release payment");
        }
        if agreement.status != AgreementStatus::Approved {
            panic!("Work must be approved before releasing payment");
        }

        let milestone_payout = if agreement.current_milestone + 1 >= agreement.milestone_count {
            agreement.funded_amount
        } else {
            agreement.amount / (agreement.milestone_count as i128)
        };

        // Transfer funds from contract to freelancer
        let token_client = token::Client::new(&env, &agreement.token);
        token_client.transfer(
            &env.current_contract_address(),
            &agreement.freelancer,
            &milestone_payout,
        );

        agreement.funded_amount -= milestone_payout;
        agreement.current_milestone += 1;

        if agreement.current_milestone >= agreement.milestone_count {
            agreement.status = AgreementStatus::Released;
        } else {
            agreement.status = AgreementStatus::Accepted; // Go back to accepted for next milestone
        }

        env.storage().persistent().set(&agreement_id, &agreement);

        env.events().publish(
            (symbol_short!("released"), agreement_id),
            milestone_payout,
        );

        agreement
    }

    // Refund client (in case of cancellations or mutual agreement)
    pub fn refund_client(env: Env, agreement_id: u32, authority: Address) -> Agreement {
        authority.require_auth();

        let mut agreement: Agreement = env
            .storage()
            .persistent()
            .get(&agreement_id)
            .unwrap_or_else(|| panic!("Agreement not found"));

        // Only allow if both parties agree, or if called by admin/escrow referee in dispute,
        // or client can refund if status is Created/Funded but not yet Accepted by freelancer.
        let is_client = authority == agreement.client;
        let is_freelancer = authority == agreement.freelancer;

        let admin_key = symbol_short!("admin");
        let is_admin = if env.storage().instance().has(&admin_key) {
            let admin: Address = env.storage().instance().get(&admin_key).unwrap();
            admin == authority
        } else {
            false
        };

        if !is_client && !is_freelancer && !is_admin {
            panic!("Unauthorized call to refund");
        }

        if agreement.status == AgreementStatus::Accepted && !is_admin && !is_freelancer {
            panic!("Active agreements can only be cancelled by freelancer, admin, or mutual consent");
        }

        let refund_amount = agreement.funded_amount;
        if refund_amount > 0 {
            let token_client = token::Client::new(&env, &agreement.token);
            token_client.transfer(
                &env.current_contract_address(),
                &agreement.client,
                &refund_amount,
            );
        }

        agreement.funded_amount = 0;
        agreement.status = AgreementStatus::Cancelled;
        env.storage().persistent().set(&agreement_id, &agreement);

        env.events().publish(
            (symbol_short!("refunded"), agreement_id),
            refund_amount,
        );

        agreement
    }

    // Raise dispute
    pub fn raise_dispute(env: Env, agreement_id: u32, party: Address) -> Agreement {
        party.require_auth();

        let mut agreement: Agreement = env
            .storage()
            .persistent()
            .get(&agreement_id)
            .unwrap_or_else(|| panic!("Agreement not found"));

        if party != agreement.client && party != agreement.freelancer {
            panic!("Only agreement parties can dispute");
        }

        if agreement.status != AgreementStatus::Accepted
            && agreement.status != AgreementStatus::Submitted
            && agreement.status != AgreementStatus::Approved
        {
            panic!("Cannot dispute in current status");
        }

        agreement.status = AgreementStatus::Disputed;
        env.storage().persistent().set(&agreement_id, &agreement);

        env.events().publish((symbol_short!("disputed"), agreement_id), party);

        agreement
    }

    // Set contract admin
    pub fn set_admin(env: Env, admin: Address, new_admin: Address) {
        let admin_key = symbol_short!("admin");
        if env.storage().instance().has(&admin_key) {
            let current_admin: Address = env.storage().instance().get(&admin_key).unwrap();
            current_admin.require_auth();
        } else {
            admin.require_auth();
        }
        env.storage().instance().set(&admin_key, &new_admin);
    }
}
