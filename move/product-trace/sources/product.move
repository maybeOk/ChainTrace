module product_trace::product {
    use std::string::String;
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use product_trace::enterprise::Enterprise;

    public struct Product has key, store {
        id: UID,
        name: String,
        description: String,
        enterprise_id: ID,
        created_at: u64,
    }

    public struct ProductManager has key {
        id: UID,
        total_products: u64,
    }

    fun init(ctx: &mut TxContext) {
        let manager = ProductManager {
            id: object::new(ctx),
            total_products: 0,
        };
        transfer::share_object(manager);
    }

    public fun create_product(
        manager: &mut ProductManager,
        enterprise: &Enterprise,
        name: String,
        description: String,
        ctx: &mut TxContext
    ) {
        let product = Product {
            id: object::new(ctx),
            name,
            description,
            enterprise_id: object::id(enterprise),
            created_at: tx_context::epoch_timestamp_ms(ctx),
        };
        manager.total_products = manager.total_products + 1;
        transfer::transfer(product, tx_context::sender(ctx));
    }

    public fun update_product(
        product: &mut Product,
        name: String,
        description: String,
        ctx: &mut TxContext
    ) {
        product.name = name;
        product.description = description;
    }

    public fun get_name(product: &Product): String {
        product.name
    }

    public fun get_description(product: &Product): String {
        product.description
    }

    public fun get_enterprise_id(product: &Product): ID {
        product.enterprise_id
    }

    public fun get_created_at(product: &Product): u64 {
        product.created_at
    }

    public fun get_id(product: &Product): ID {
        object::id(product)
    }

    public fun get_total_products(manager: &ProductManager): u64 {
        manager.total_products
    }
}