interface DynamicField {
    id: string;
    name: string;
    value: string;
    type: 'text' | 'date' | 'number' | 'select';
}

interface Enterprise {
    id: string;
    name: string;
    description: string;
    owner: string;
    createdAt: number;
    productCount: number;
}

interface Product {
    id: string;
    name: string;
    category: string;
    description: string;
    fields: DynamicField[];
    quantity: number;
    status: 'pending' | 'on_chain' | 'processing' | 'failed';
    chainId: string | null;
    chainHeight: number | null;
    onChainAt: number | null;
    qrcodeCount: number;
    scanCount: number;
    nftClaimCount: number;
    createdAt: number;
    updatedAt: number;
}

interface QRCodeRecord {
    id: string;
    productId: string;
    firstScanner: string;
    firstScanTime: number;
    isClaimed: boolean;
    scanCount: number;
}

interface NFT {
    id: string;
    productId: string;
    owner: string;
    mintedAt: number;
}

let enterprises: Map<string, Enterprise> = new Map();
let products: Map<string, Product> = new Map();
let qrcodes: Map<string, QRCodeRecord> = new Map();
let nfts: Map<string, NFT> = new Map();

function generateSecureId(): string {
    const randomBytes = new Uint8Array(16);
    crypto.getRandomValues(randomBytes);
    const hexString = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    return hexString;
}

function generateQRCodeId(productId: string, index: number): string {
    const randomBytes = new Uint8Array(12);
    crypto.getRandomValues(randomBytes);
    const timestamp = Date.now().toString(36);
    const randomHex = Array.from(randomBytes)
        .map(b => b.toString(16).padStart(2, '0'))
        .join('');
    const productHash = Array.from(new TextEncoder().encode(productId))
        .reduce((acc, val) => (acc * 31 + val) % 0x100000000, 0)
        .toString(36);
    const combined = `${timestamp}-${productHash}-${randomHex}-${index.toString(36)}`;
    return combined;
}

export const mockStore = {
    registerEnterprise: (name: string, description: string, owner: string): Enterprise => {
        const enterprise: Enterprise = {
            id: generateSecureId(),
            name,
            description,
            owner,
            createdAt: Date.now(),
            productCount: 0,
        };
        enterprises.set(enterprise.id, enterprise);
        return enterprise;
    },

    getEnterpriseByOwner: (owner: string): Enterprise | undefined => {
        for (const enterprise of enterprises.values()) {
            if (enterprise.owner === owner) {
                return enterprise;
            }
        }
        return undefined;
    },

    updateEnterprise: (id: string, name: string, description: string): Enterprise | null => {
        const enterprise = enterprises.get(id);
        if (!enterprise) return null;
        enterprise.name = name;
        enterprise.description = description;
        return enterprise;
    },

    getQRCodeByProductId: (productId: string): QRCodeRecord[] => {
        const results: QRCodeRecord[] = [];
        for (const qrcode of qrcodes.values()) {
            if (qrcode.productId === productId) {
                results.push(qrcode);
            }
        }
        return results;
    },

    createProduct: (
        enterpriseId: string,
        name: string,
        category: string,
        description: string,
        fields: DynamicField[] = [],
        quantity: number = 1
    ): Product => {
        const enterprise = enterprises.get(enterpriseId);
        if (enterprise) {
            enterprise.productCount++;
        }

        const product: Product = {
            id: generateSecureId(),
            name,
            category,
            description,
            fields,
            quantity,
            status: 'pending',
            chainId: null,
            chainHeight: null,
            onChainAt: null,
            qrcodeCount: 0,
            scanCount: 0,
            nftClaimCount: 0,
            createdAt: Date.now(),
            updatedAt: Date.now(),
        };
        products.set(product.id, product);
        return product;
    },

    getProductsByEnterprise: (_enterpriseId: string): Product[] => {
        const result: Product[] = [];
        for (const product of products.values()) {
            result.push(product);
        }
        return result;
    },

    getProductsByStatus: (status: Product['status']): Product[] => {
        const result: Product[] = [];
        for (const product of products.values()) {
            if (product.status === status) {
                result.push(product);
            }
        }
        return result;
    },

    getAllProducts: (): Product[] => {
        return Array.from(products.values());
    },

    getProductById: (productId: string): Product | null => {
        return products.get(productId) || null;
    },

    updateProduct: (productId: string, updates: Partial<Product>): Product | null => {
        const product = products.get(productId);
        if (!product) return null;

        Object.assign(product, updates, { updatedAt: Date.now() });
        return product;
    },

    addProductField: (productId: string, field: Omit<DynamicField, 'id'>): Product | null => {
        const product = products.get(productId);
        if (!product) return null;

        const newField: DynamicField = {
            ...field,
            id: generateSecureId(),
        };
        product.fields.push(newField);
        product.updatedAt = Date.now();
        return product;
    },

    removeProductField: (productId: string, fieldId: string): Product | null => {
        const product = products.get(productId);
        if (!product) return null;

        product.fields = product.fields.filter(f => f.id !== fieldId);
        product.updatedAt = Date.now();
        return product;
    },

    updateProductField: (productId: string, fieldId: string, updates: Partial<DynamicField>): Product | null => {
        const product = products.get(productId);
        if (!product) return null;

        const field = product.fields.find(f => f.id === fieldId);
        if (!field) return null;

        Object.assign(field, updates);
        product.updatedAt = Date.now();
        return product;
    },

    deleteProduct: (productId: string): boolean => {
        const product = products.get(productId);
        if (!product) return false;

        if (product.status === 'on_chain') {
            return false;
        }

        products.delete(productId);
        return true;
    },

    uploadProductToChain: (productId: string): Product | null => {
        const product = products.get(productId);
        if (!product) return null;

        product.status = 'processing';

        setTimeout(() => {
            product.status = 'on_chain';
            product.chainId = generateSecureId();
            product.chainHeight = Math.floor(Math.random() * 10000000) + 10000000;
            product.onChainAt = Date.now();
            product.updatedAt = Date.now();
        }, 1000);

        return product;
    },

    batchUploadToChain: (productIds: string[]): Product[] => {
        const results: Product[] = [];
        for (const id of productIds) {
            const product = mockStore.uploadProductToChain(id);
            if (product) {
                results.push(product);
            }
        }
        return results;
    },

    createQRCode: (productId: string): QRCodeRecord => {
        const product = products.get(productId);
        const index = product ? product.qrcodeCount : Math.floor(Math.random() * 1000000);
        const qrcode: QRCodeRecord = {
            id: generateQRCodeId(productId, index),
            productId,
            firstScanner: "",
            firstScanTime: 0,
            isClaimed: false,
            scanCount: 0,
        };
        qrcodes.set(qrcode.id, qrcode);

        if (product) {
            product.qrcodeCount++;
        }

        return qrcode;
    },

    createBatchQRCode: (productId: string, count: number): QRCodeRecord[] => {
        const results: QRCodeRecord[] = [];
        const product = products.get(productId);
        if (!product) return results;

        const remaining = product.quantity - product.qrcodeCount;
        const actualCount = Math.min(count, remaining);

        for (let i = 0; i < actualCount; i++) {
            const qrcode: QRCodeRecord = {
                id: generateQRCodeId(productId, product.qrcodeCount + i),
                productId,
                firstScanner: "",
                firstScanTime: 0,
                isClaimed: false,
                scanCount: 0,
            };
            qrcodes.set(qrcode.id, qrcode);
            results.push(qrcode);
        }

        product.qrcodeCount += actualCount;
        product.updatedAt = Date.now();

        return results;
    },

    scanQRCode: (qrcodeId: string, scanner: string): QRCodeRecord | null => {
        const qrcode = qrcodes.get(qrcodeId);
        if (!qrcode) return null;

        qrcode.scanCount++;

        if (qrcode.firstScanTime === 0) {
            qrcode.firstScanner = scanner;
            qrcode.firstScanTime = Date.now();
        }

        const product = products.get(qrcode.productId);
        if (product) {
            product.scanCount++;
        }

        return qrcode;
    },

    claimNFT: (qrcodeId: string, claimer: string): NFT | null => {
        const qrcode = qrcodes.get(qrcodeId);
        if (!qrcode) return null;
        if (qrcode.isClaimed) return null;
        if (qrcode.firstScanner !== claimer) return null;
        if (qrcode.firstScanTime === 0) return null;

        qrcode.isClaimed = true;

        const nft: NFT = {
            id: generateSecureId(),
            productId: qrcode.productId,
            owner: claimer,
            mintedAt: Date.now(),
        };
        nfts.set(nft.id, nft);

        const product = products.get(qrcode.productId);
        if (product) {
            product.nftClaimCount++;
        }

        return nft;
    },

    getQRCodeInfo: (qrcodeId: string): QRCodeRecord | null => {
        return qrcodes.get(qrcodeId) || null;
    },

    getProductInfo: (productId: string): Product | null => {
        return products.get(productId) || null;
    },

    clearAll: () => {
        enterprises.clear();
        products.clear();
        qrcodes.clear();
        nfts.clear();
    },
};

export type { Enterprise, Product, QRCodeRecord, NFT, DynamicField };