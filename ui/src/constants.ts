export const TESTNET_HELLO_WORLD_PACKAGE_ID = "0x4e1cf62ae7d377c7404ac2a617598754a548a5de6a599f236a53603d5674d8b8";

export const TESTNET_PRODUCT_TRACE_PACKAGE_ID = "0x0";

export const PRODUCT_TRACE_FUNCTIONS = {
    registerEnterprise: "product_trace::enterprise::register",
    createProduct: "product_trace::product::create_product",
    updateProduct: "product_trace::product::update_product",
    createQRCode: "product_trace::qrcode::create_qrcode",
    scanQRCode: "product_trace::qrcode::scan_qrcode",
    claimNFT: "product_trace::qrcode::claim_nft",
};

export const PRODUCT_TRACE_STRUCTS = {
    Product: "product_trace::product::Product",
    ProductManager: "product_trace::product::ProductManager",
    QRCodeRecord: "product_trace::qrcode::QRCodeRecord",
    QRCodeManager: "product_trace::qrcode::QRCodeManager",
    NFTManager: "product_trace::nft::NFTManager",
};