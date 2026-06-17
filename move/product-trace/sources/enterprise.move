module product_trace::enterprise {
    use std::string::String;
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use sui::event;

    public struct Enterprise has key {
        id: UID,
        name: String,
        description: String,
        owner: address,
        created_at: u64,
        product_count: u64,
    }

    public struct EnterpriseManager has key {
        id: UID,
        total_enterprises: u64,
    }

    public struct EnterpriseRegistered has copy, drop {
        enterprise_id: ID,
        owner: address,
        name: String,
    }

    const ENotOwner: u64 = 1;

    fun init(ctx: &mut TxContext) {
        let manager = EnterpriseManager {
            id: object::new(ctx),
            total_enterprises: 0,
        };
        transfer::share_object(manager);
    }

    public fun register(
        manager: &mut EnterpriseManager,
        name: String,
        description: String,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        let enterprise = Enterprise {
            id: object::new(ctx),
            name,
            description,
            owner: sender,
            created_at: tx_context::epoch_timestamp_ms(ctx),
            product_count: 0,
        };
        
        manager.total_enterprises = manager.total_enterprises + 1;
        
        event::emit(EnterpriseRegistered {
            enterprise_id: object::id(&enterprise),
            owner: sender,
            name,
        });
        
        transfer::transfer(enterprise, sender);
    }

    public fun update_info(
        enterprise: &mut Enterprise,
        name: String,
        description: String,
        ctx: &mut TxContext
    ) {
        assert!(enterprise.owner == tx_context::sender(ctx), ENotOwner);
        enterprise.name = name;
        enterprise.description = description;
    }

    public fun increment_product_count(
        enterprise: &mut Enterprise,
        ctx: &mut TxContext
    ) {
        assert!(enterprise.owner == tx_context::sender(ctx), ENotOwner);
        enterprise.product_count = enterprise.product_count + 1;
    }

    public fun get_name(enterprise: &Enterprise): String {
        enterprise.name
    }

    public fun get_description(enterprise: &Enterprise): String {
        enterprise.description
    }

    public fun get_owner(enterprise: &Enterprise): address {
        enterprise.owner
    }

    public fun get_created_at(enterprise: &Enterprise): u64 {
        enterprise.created_at
    }

    public fun get_product_count(enterprise: &Enterprise): u64 {
        enterprise.product_count
    }

    public fun get_total_enterprises(manager: &EnterpriseManager): u64 {
        manager.total_enterprises
    }
}