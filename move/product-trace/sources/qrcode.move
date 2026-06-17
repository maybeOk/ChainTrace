module product_trace::qrcode {
    use std::string::String;
    use sui::object::{Self, UID, ID};
    use sui::transfer;
    use sui::tx_context::{Self, TxContext};
    use product_trace::product::Product;
    use product_trace::nft::{Self, NFTManager};

    public struct QRCodeRecord has key {
        id: UID,
        product_id: ID,
        first_scanner: address,
        first_scan_time: u64,
        is_claimed: bool,
        scan_count: u64,
    }

    public struct QRCodeManager has key {
        id: UID,
        total_codes: u64,
        total_scans: u64,
        total_claims: u64,
    }

    const EAlreadyClaimed: u64 = 1;
    const ENotFirstScanner: u64 = 2;
    const EInvalidProduct: u64 = 3;

    fun init(ctx: &mut TxContext) {
        let manager = QRCodeManager {
            id: object::new(ctx),
            total_codes: 0,
            total_scans: 0,
            total_claims: 0,
        };
        transfer::share_object(manager);
    }

    public fun create_qrcode(
        manager: &mut QRCodeManager,
        product: &Product,
        ctx: &mut TxContext
    ) {
        let record = QRCodeRecord {
            id: object::new(ctx),
            product_id: object::id(product),
            first_scanner: @0x0,
            first_scan_time: 0,
            is_claimed: false,
            scan_count: 0,
        };
        manager.total_codes = manager.total_codes + 1;
        transfer::share_object(record);
    }

    public fun scan_qrcode(
        qrcode_manager: &mut QRCodeManager,
        record: &mut QRCodeRecord,
        ctx: &mut TxContext
    ) {
        let scanner = tx_context::sender(ctx);
        let now = tx_context::epoch_timestamp_ms(ctx);
        
        qrcode_manager.total_scans = qrcode_manager.total_scans + 1;
        record.scan_count = record.scan_count + 1;
        
        if (record.first_scan_time == 0) {
            record.first_scanner = scanner;
            record.first_scan_time = now;
        }
    }

    public fun claim_nft(
        qrcode_manager: &mut QRCodeManager,
        nft_manager: &mut NFTManager,
        record: &mut QRCodeRecord,
        product: &Product,
        ctx: &mut TxContext
    ) {
        let sender = tx_context::sender(ctx);
        
        assert!(!record.is_claimed, EAlreadyClaimed);
        assert!(record.first_scanner == sender, ENotFirstScanner);
        assert!(record.first_scan_time != 0, EInvalidProduct);
        
        nft::mint(nft_manager, product, sender, ctx);
        
        record.is_claimed = true;
        qrcode_manager.total_claims = qrcode_manager.total_claims + 1;
    }

    public fun get_qrcode_info(
        record: &QRCodeRecord
    ): (ID, address, u64, bool, u64) {
        (
            record.product_id,
            record.first_scanner,
            record.first_scan_time,
            record.is_claimed,
            record.scan_count
        )
    }

    public fun is_claimed(record: &QRCodeRecord): bool {
        record.is_claimed
    }

    public fun get_scan_count(record: &QRCodeRecord): u64 {
        record.scan_count
    }

    public fun get_first_scan_time(record: &QRCodeRecord): u64 {
        record.first_scan_time
    }

    public fun get_first_scanner(record: &QRCodeRecord): address {
        record.first_scanner
    }
}