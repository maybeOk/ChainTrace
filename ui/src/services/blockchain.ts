import { mockStore } from "../store/mockStore";
import { useCurrentAccount } from "@mysten/dapp-kit-react";

export const USE_REAL_BLOCKCHAIN = false;

interface RegisterEnterpriseParams {
    name: string;
    description: string;
}

interface CreateProductParams {
    enterpriseId: string;
    enterpriseVersion: string;
    name: string;
    description: string;
    category: string;
    fields: any[];
}

interface CreateQRCodeParams {
    productId: string;
    productVersion: string;
}

interface ScanQRCodeParams {
    qrcodeId: string;
    qrcodeVersion: string;
    scanner: string;
}

interface ClaimNFTParams {
    qrcodeId: string;
    qrcodeVersion: string;
    productId: string;
    productVersion: string;
    claimer: string;
}

export function useBlockchainService() {
    const currentAccount = useCurrentAccount();

    const registerEnterprise = async (params: RegisterEnterpriseParams) => {
        if (!USE_REAL_BLOCKCHAIN) {
            const owner = currentAccount?.address || "mock-owner";
            return {
                mock: true,
                data: mockStore.registerEnterprise(params.name, params.description, owner),
            };
        }

        return {
            mock: false,
            message: "Real blockchain registration not implemented yet",
        };
    };

    const createProduct = async (params: CreateProductParams) => {
        if (!USE_REAL_BLOCKCHAIN) {
            return {
                mock: true,
                data: mockStore.createProduct(
                    params.enterpriseId,
                    params.name,
                    params.category,
                    params.description,
                    params.fields
                ),
            };
        }

        return {
            mock: false,
            message: "Real blockchain createProduct not implemented yet",
        };
    };

    const uploadProductToChain = async (productId: string) => {
        if (!USE_REAL_BLOCKCHAIN) {
            return {
                mock: true,
                data: mockStore.uploadProductToChain(productId),
            };
        }

        return {
            mock: false,
            message: "Product already on chain (real blockchain mode)",
        };
    };

    const createQRCode = async (params: CreateQRCodeParams) => {
        if (!USE_REAL_BLOCKCHAIN) {
            return {
                mock: true,
                data: mockStore.createQRCode(params.productId),
            };
        }

        return {
            mock: false,
            message: "Real blockchain createQRCode not implemented yet",
        };
    };

    const scanQRCode = async (params: ScanQRCodeParams) => {
        if (!USE_REAL_BLOCKCHAIN) {
            return {
                mock: true,
                data: mockStore.scanQRCode(params.qrcodeId, params.scanner),
            };
        }

        return {
            mock: false,
            message: "Real blockchain scanQRCode not implemented yet",
        };
    };

    const claimNFT = async (params: ClaimNFTParams) => {
        if (!USE_REAL_BLOCKCHAIN) {
            return {
                mock: true,
                data: mockStore.claimNFT(params.qrcodeId, params.claimer),
            };
        }

        return {
            mock: false,
            message: "Real blockchain claimNFT not implemented yet",
        };
    };

    const getQRCodeInfo = async (qrcodeId: string) => {
        return mockStore.getQRCodeInfo(qrcodeId);
    };

    const getProductInfo = async (productId: string) => {
        return mockStore.getProductInfo(productId);
    };

    return {
        registerEnterprise,
        createProduct,
        uploadProductToChain,
        createQRCode,
        scanQRCode,
        claimNFT,
        getQRCodeInfo,
        getProductInfo,
    };
}