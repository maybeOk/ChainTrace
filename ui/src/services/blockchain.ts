import { mockStore } from "../store/mockStore";
import { useCurrentAccount, useDAppKit } from "@mysten/dapp-kit-react";
import { Transaction } from "@mysten/sui/transactions";

// 配置 - 从环境变量读取
const PACKAGE_ID = import.meta.env.VITE_CONTRACT_PACKAGE_ID || "0x0";
const USE_REAL_BLOCKCHAIN = import.meta.env.VITE_USE_REAL_BLOCKCHAIN === "true";

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
    const dAppKit = useDAppKit();

    /**
     * 执行交易并等待结果
     */
    const executeTransaction = async (tx: Transaction): Promise<any> => {
        return new Promise((resolve, reject) => {
            dAppKit.signAndExecuteTransaction({
                transaction: tx,
            }).then((result: any) => {
                // 等待交易确认
                setTimeout(() => resolve(result), 1000);
            }).catch(reject);
        });
    };

    /**
     * 注册企业 - 真实链上交互
     */
    const registerEnterpriseOnChain = async (name: string, description: string) => {
        try {
            const tx = new Transaction();
            tx.setGasBudget(10000000);

            // 调用企业注册函数
            tx.moveCall({
                target: `${PACKAGE_ID}::enterprise::register`,
                arguments: [
                    tx.object("0x0000000000000000000000000000000000000000000000000000000000000006"), // EnterpriseManager ID
                    tx.pure.string(name),
                    tx.pure.string(description),
                ],
            });

            const result = await executeTransaction(tx);
            console.log("Enterprise registered:", result);
            return result;
        } catch (error) {
            console.error("Failed to register enterprise on chain:", error);
            throw error;
        }
    };

    /**
     * 创建商品 - 真实链上交互
     */
    const createProductOnChain = async (
        enterpriseObjId: string,
        name: string,
        description: string
    ) => {
        try {
            const tx = new Transaction();
            tx.setGasBudget(10000000);

            tx.moveCall({
                target: `${PACKAGE_ID}::product::create_product`,
                arguments: [
                    tx.object("0x0000000000000000000000000000000000000000000000000000000000000007"), // ProductManager ID
                    tx.object(enterpriseObjId),
                    tx.pure.string(name),
                    tx.pure.string(description),
                ],
            });

            const result = await executeTransaction(tx);
            console.log("Product created on chain:", result);
            return result;
        } catch (error) {
            console.error("Failed to create product on chain:", error);
            throw error;
        }
    };

    /**
     * 创建二维码 - 真实链上交互
     */
    const createQRCodeOnChain = async (productObjId: string) => {
        try {
            const tx = new Transaction();
            tx.setGasBudget(10000000);

            tx.moveCall({
                target: `${PACKAGE_ID}::qrcode::create_qrcode`,
                arguments: [
                    tx.object("0x0000000000000000000000000000000000000000000000000000000000000009"), // QRCodeManager ID
                    tx.object(productObjId),
                ],
            });

            const result = await executeTransaction(tx);
            console.log("QRCode created on chain:", result);
            return result;
        } catch (error) {
            console.error("Failed to create QRCode on chain:", error);
            throw error;
        }
    };

    /**
     * 扫描二维码 - 真实链上交互
     */
    const scanQRCodeOnChain = async (qrcodeObjId: string) => {
        try {
            const tx = new Transaction();
            tx.setGasBudget(10000000);

            tx.moveCall({
                target: `${PACKAGE_ID}::qrcode::scan_qrcode`,
                arguments: [
                    tx.object("0x0000000000000000000000000000000000000000000000000000000000000009"), // QRCodeManager ID
                    tx.object(qrcodeObjId),
                ],
            });

            const result = await executeTransaction(tx);
            console.log("QRCode scanned on chain:", result);
            return result;
        } catch (error) {
            console.error("Failed to scan QRCode on chain:", error);
            throw error;
        }
    };

    /**
     * 领取 NFT - 真实链上交互
     */
    const claimNFTOnChain = async (
        qrcodeObjId: string,
        productObjId: string
    ) => {
        try {
            const tx = new Transaction();
            tx.setGasBudget(10000000);

            tx.moveCall({
                target: `${PACKAGE_ID}::qrcode::claim_nft`,
                arguments: [
                    tx.object("0x0000000000000000000000000000000000000000000000000000000000000009"), // QRCodeManager ID
                    tx.object("0x0000000000000000000000000000000000000000000000000000000000000008"), // NFTManager ID
                    tx.object(qrcodeObjId),
                    tx.object(productObjId),
                ],
            });

            const result = await executeTransaction(tx);
            console.log("NFT claimed on chain:", result);
            return result;
        } catch (error) {
            console.error("Failed to claim NFT on chain:", error);
            throw error;
        }
    };

    // ============= Mock 模式服务 =============

    const registerEnterprise = async (params: RegisterEnterpriseParams) => {
        if (!USE_REAL_BLOCKCHAIN) {
            const owner = currentAccount?.address || "mock-owner";
            return {
                mock: true,
                data: mockStore.registerEnterprise(params.name, params.description, owner),
            };
        }

        if (!currentAccount) {
            throw new Error("Please connect wallet first");
        }

        const result = await registerEnterpriseOnChain(
            params.name,
            params.description
        );

        // 从交易结果中提取创建的对象ID
        const createdObject = result.objectChanges?.find(
            (change: any) => change.type === "created" && change.objectType?.includes("Enterprise")
        );

        return {
            mock: false,
            data: createdObject ? {
                id: createdObject.objectId,
                name: params.name,
                description: params.description,
                owner: currentAccount.address,
                createdAt: Date.now(),
                productCount: 0,
            } : null,
            txDigest: result.digest,
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

        if (!currentAccount) {
            throw new Error("Please connect wallet first");
        }

        const result = await createProductOnChain(
            params.enterpriseId,
            params.name,
            params.description
        );

        const createdObject = result.objectChanges?.find(
            (change: any) => change.type === "created" && change.objectType?.includes("Product")
        );

        return {
            mock: false,
            data: createdObject ? {
                id: createdObject.objectId,
                name: params.name,
                description: params.description,
                enterpriseId: params.enterpriseId,
                createdAt: Date.now(),
            } : null,
            txDigest: result.digest,
        };
    };

    const uploadProductToChain = async (productId: string) => {
        if (!USE_REAL_BLOCKCHAIN) {
            return {
                mock: true,
                data: mockStore.uploadProductToChain(productId),
            };
        }

        // 真实模式下，商品已经存在于链上，这里标记为已上链
        return {
            mock: false,
            message: "Product is on chain (real blockchain mode)",
            productId,
        };
    };

    const createQRCode = async (params: CreateQRCodeParams) => {
        if (!USE_REAL_BLOCKCHAIN) {
            return {
                mock: true,
                data: mockStore.createQRCode(params.productId),
            };
        }

        if (!currentAccount) {
            throw new Error("Please connect wallet first");
        }

        const result = await createQRCodeOnChain(params.productId);

        const createdObject = result.objectChanges?.find(
            (change: any) => change.type === "created" && change.objectType?.includes("QRCodeRecord")
        );

        return {
            mock: false,
            data: createdObject ? {
                id: createdObject.objectId,
                productId: params.productId,
                firstScanner: "0x0",
                firstScanTime: 0,
                isClaimed: false,
                scanCount: 0,
            } : null,
            txDigest: result.digest,
        };
    };

    const scanQRCode = async (params: ScanQRCodeParams) => {
        if (!USE_REAL_BLOCKCHAIN) {
            return {
                mock: true,
                data: mockStore.scanQRCode(params.qrcodeId, params.scanner),
            };
        }

        if (!currentAccount) {
            throw new Error("Please connect wallet first");
        }

        const result = await scanQRCodeOnChain(params.qrcodeId);

        return {
            mock: false,
            data: {
                id: params.qrcodeId,
                productId: "",
                firstScanner: currentAccount.address,
                firstScanTime: Date.now(),
                isClaimed: false,
                scanCount: 1,
            },
            txDigest: result.digest,
        };
    };

    const claimNFT = async (params: ClaimNFTParams) => {
        if (!USE_REAL_BLOCKCHAIN) {
            return {
                mock: true,
                data: mockStore.claimNFT(params.qrcodeId, params.claimer),
            };
        }

        if (!currentAccount) {
            throw new Error("Please connect wallet first");
        }

        const result = await claimNFTOnChain(params.qrcodeId, params.productId);

        const createdObject = result.objectChanges?.find(
            (change: any) => change.type === "created" && change.objectType?.includes("ProductNFT")
        );

        return {
            mock: false,
            data: createdObject ? {
                id: createdObject.objectId,
                productId: params.productId,
                mintedAt: Date.now(),
            } : null,
            txDigest: result.digest,
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
        // 导出不带 mock 的链上方法，供高级使用
        registerEnterpriseOnChain,
        createProductOnChain,
        createQRCodeOnChain,
        scanQRCodeOnChain,
        claimNFTOnChain,
    };
}

// 导出配置常量供其他地方使用
export const config = {
    PACKAGE_ID,
    USE_REAL_BLOCKCHAIN,
};
