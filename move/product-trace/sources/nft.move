module product_trace::nft {
    use std::string::String;
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use product_trace::product::{Self, Product};

    public struct ProductNFT has key, store {
        id: UID,
        name: String,
        description: String,
        product_id: ID,
        creator: ID,
        minted_at: u64,
    }

    public struct NFTManager has key {
        id: UID,
        total_minted: u64,
    }

    fun init(ctx: &mut TxContext) {
        let manager = NFTManager {
            id: object::new(ctx),
            total_minted: 0,
        };
        transfer::share_object(manager);
    }

    public fun mint(
        manager: &mut NFTManager,
        product: &Product,
        recipient: address,
        ctx: &mut TxContext
    ) {
        let nft = ProductNFT {
            id: object::new(ctx),
            name: product::get_name(product),
            description: product::get_description(product),
            product_id: product::get_id(product),
            creator: product::get_enterprise_id(product),
            minted_at: tx_context::epoch_timestamp_ms(ctx),
        };
        manager.total_minted = manager.total_minted + 1;
        transfer::transfer(nft, recipient);
    }

    public fun get_name(nft: &ProductNFT): String {
        nft.name
    }

    public fun get_description(nft: &ProductNFT): String {
        nft.description
    }

    public fun get_product_id(nft: &ProductNFT): ID {
        nft.product_id
    }

    public fun get_creator(nft: &ProductNFT): ID {
        nft.creator
    }

    public fun get_minted_at(nft: &ProductNFT): u64 {
        nft.minted_at
    }

    public fun get_total_minted(manager: &NFTManager): u64 {
        manager.total_minted
    }
}