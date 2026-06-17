import { useState, useEffect } from "react";
import { mockStore, type Enterprise, type Product } from "../store/mockStore";
import { CreateProduct } from "./CreateProduct";
import { ProductDetail } from "./ProductDetail";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useBlockchainService } from "../services/blockchain";

interface DashboardProps {
    enterprise: Enterprise;
}

type TabType = "all" | "pending" | "on_chain";

export function Dashboard({ enterprise }: DashboardProps) {
    const [showCreateProduct, setShowCreateProduct] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [products, setProducts] = useState<Product[]>([]);
    const [activeTab, setActiveTab] = useState<TabType>("all");
    const [searchKeyword, setSearchKeyword] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { uploadProductToChain } = useBlockchainService();

    const categories = [t("all"), t("food"), t("clothing"), t("electronics"), t("cosmetics"), t("agricultural"), t("medicine"), t("other")];

    const loadProducts = () => {
        let allProducts = mockStore.getAllProducts();

        if (activeTab !== "all") {
            allProducts = allProducts.filter(p => p.status === activeTab);
        }

        if (searchKeyword.trim()) {
            allProducts = allProducts.filter(p =>
                p.name.toLowerCase().includes(searchKeyword.toLowerCase()) ||
                p.description.toLowerCase().includes(searchKeyword.toLowerCase())
            );
        }

        if (selectedCategory && selectedCategory !== t("all")) {
            const categoryMap: Record<string, string> = {
                [t("food")]: "食品",
                [t("clothing")]: "服装",
                [t("electronics")]: "电子产品",
                [t("cosmetics")]: "化妆品",
                [t("agricultural")]: "农产品",
                [t("medicine")]: "医药",
                [t("other")]: "其他",
            };
            const mappedCategory = categoryMap[selectedCategory] || selectedCategory;
            allProducts = allProducts.filter(p => p.category === mappedCategory);
        }

        setProducts(allProducts);
        setSelectedIds([]);
    };

    useEffect(() => {
        loadProducts();
    }, [activeTab, searchKeyword, selectedCategory]);

    const handleCreateProduct = () => {
        loadProducts();
    };

    const handleProductUpdate = () => {
        loadProducts();
        if (selectedProduct) {
            const updated = mockStore.getProductById(selectedProduct.id);
            if (updated) {
                setSelectedProduct(updated);
            }
        }
    };

    const handleUploadToChain = async (productId: string) => {
        await uploadProductToChain(productId);
        alert(t("scanning"));
        loadProducts();
    };

    const handleBatchUpload = () => {
        if (selectedIds.length === 0) {
            alert(t("pleaseSelectProducts"));
            return;
        }

        if (!confirm(`${t("uploadConfirm")} ${selectedIds.length} ${t("itemsToChain")}`)) {
            return;
        }

        mockStore.batchUploadToChain(selectedIds);
        alert(t("uploadingBatch"));
        loadProducts();
    };

    const handleDeleteProduct = (productId: string) => {
        if (!confirm(t("confirmDeleteProduct"))) {
            return;
        }

        const success = mockStore.deleteProduct(productId);
        if (success) {
            alert(t("deleted"));
            loadProducts();
        } else {
            alert(t("cannotDeleteOnChain"));
        }
    };

    const handleSelectAll = () => {
        if (selectedIds.length === products.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(products.map(p => p.id));
        }
    };

    const handleToggleSelect = (productId: string) => {
        if (selectedIds.includes(productId)) {
            setSelectedIds(selectedIds.filter(id => id !== productId));
        } else {
            setSelectedIds([...selectedIds, productId]);
        }
    };

    const pendingCount = mockStore.getAllProducts().filter(p => p.status === 'pending').length;
    const onChainCount = mockStore.getAllProducts().filter(p => p.status === 'on_chain').length;
    const processingCount = mockStore.getAllProducts().filter(p => p.status === 'processing').length;
    const totalCount = mockStore.getAllProducts().length;

    if (showCreateProduct) {
        return (
            <div style={{ padding: "20px", maxWidth: 800, margin: "0 auto" }}>
                <button 
                    onClick={() => setShowCreateProduct(false)}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: `1px solid ${theme.border}`,
                        cursor: "pointer",
                        fontSize: "14px",
                        background: theme.surface,
                        color: theme.text,
                        marginBottom: "16px"
                    }}
                >
                    ← {t("close")}
                </button>
                <CreateProduct
                    enterprise={enterprise}
                    onCreated={handleCreateProduct}
                    onClose={() => setShowCreateProduct(false)}
                />
            </div>
        );
    }

    if (selectedProduct) {
        return (
            <div style={{ padding: "20px", maxWidth: 800, margin: "0 auto" }}>
                <button 
                    onClick={() => setSelectedProduct(null)}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: `1px solid ${theme.border}`,
                        cursor: "pointer",
                        fontSize: "14px",
                        background: theme.surface,
                        color: theme.text,
                        marginBottom: "16px"
                    }}
                >
                    ← {t("close")}
                </button>
                <ProductDetail
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                    onUpdate={handleProductUpdate}
                />
            </div>
        );
    }

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ 
                padding: "24px", 
                marginBottom: "20px", 
                background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.secondary} 100%)`,
                borderRadius: "12px"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <h1 style={{ color: "white", margin: "0 0 8px 0", fontSize: "24px" }}>
                            {t("productTraceabilityManagement")}
                        </h1>
                        <p style={{ color: "rgba(255,255,255,0.9)", margin: "0 0 16px 0" }}>
                            {t("traceFlow")}
                        </p>
                        <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
                            <span style={{ 
                                background: "rgba(255,255,255,0.2)", 
                                color: "white", 
                                padding: "6px 12px", 
                                borderRadius: "20px",
                                fontSize: "14px"
                            }}>{t("totalProducts")}: {totalCount}</span>
                            <span style={{ 
                                background: "rgba(255,255,255,0.2)", 
                                color: "white", 
                                padding: "6px 12px", 
                                borderRadius: "20px",
                                fontSize: "14px"
                            }}>{t("pendingChain")}: {pendingCount}</span>
                            <span style={{ 
                                background: "rgba(255,255,255,0.2)", 
                                color: "white", 
                                padding: "6px 12px", 
                                borderRadius: "20px",
                                fontSize: "14px"
                            }}>{t("onChain")}: {onChainCount}</span>
                            {processingCount > 0 && (
                                <span style={{ 
                                    background: "rgba(255,255,255,0.2)", 
                                    color: "white", 
                                    padding: "6px 12px", 
                                    borderRadius: "20px",
                                    fontSize: "14px"
                                }}>{t("processing")}: {processingCount}</span>
                            )}
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateProduct(true)}
                        style={{ 
                            background: "white", 
                            color: theme.primary, 
                            fontWeight: "bold",
                            border: "none",
                            padding: "10px 20px",
                            borderRadius: "8px",
                            fontSize: "16px",
                            cursor: "pointer",
                            boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
                        }}
                    >
                        {t("publishProduct")}
                    </button>
                </div>
            </div>

            <div style={{ 
                padding: "16px", 
                marginBottom: "16px", 
                background: theme.surface,
                borderRadius: "8px",
                boxShadow: theme.shadow
            }}>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                    <input
                        type="text"
                        placeholder={t("searchPlaceholder")}
                        value={searchKeyword}
                        onChange={(e) => setSearchKeyword(e.target.value)}
                        style={{ 
                            width: "250px", 
                            padding: "10px 14px",
                            borderRadius: "8px",
                            border: `2px solid ${theme.border}`,
                            fontSize: "14px",
                            backgroundColor: theme.surface,
                            color: theme.text,
                            outline: "none",
                            transition: "border-color 0.2s ease"
                        }}
                        onFocus={(e) => {
                            (e.target as HTMLInputElement).style.borderColor = theme.primary;
                            (e.target as HTMLInputElement).style.boxShadow = `0 0 0 3px ${theme.primary}20`;
                        }}
                        onBlur={(e) => {
                            (e.target as HTMLInputElement).style.borderColor = theme.border;
                            (e.target as HTMLInputElement).style.boxShadow = "none";
                        }}
                    />
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ 
                            padding: "10px 40px 10px 14px", 
                            borderRadius: "8px", 
                            border: `2px solid ${theme.border}`, 
                            backgroundColor: theme.surface,
                            fontSize: "14px",
                            color: theme.text,
                            cursor: "pointer",
                            outline: "none",
                            transition: "border-color 0.2s ease",
                            appearance: "none",
                            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E\")",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "right 12px center"
                        }}
                        onFocus={(e) => {
                            (e.target as HTMLSelectElement).style.borderColor = theme.primary;
                            (e.target as HTMLSelectElement).style.boxShadow = `0 0 0 3px ${theme.primary}20`;
                        }}
                        onBlur={(e) => {
                            (e.target as HTMLSelectElement).style.borderColor = theme.border;
                            (e.target as HTMLSelectElement).style.boxShadow = "none";
                        }}
                    >
                        {categories.map((cat) => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                    {selectedIds.length > 0 && (
                        <button
                            onClick={handleBatchUpload}
                            style={{ 
                                background: theme.success, 
                                color: "white", 
                                border: "none",
                                padding: "8px 16px",
                                borderRadius: "6px",
                                fontSize: "14px",
                                cursor: "pointer"
                            }}
                        >
                            {t("batchUpload")} ({selectedIds.length})
                        </button>
                    )}
                </div>
            </div>

            <div style={{ 
                background: theme.surface,
                borderRadius: "8px",
                boxShadow: theme.shadow,
                overflow: "hidden"
            }}>
                <div style={{ 
                    padding: "16px 24px", 
                    borderBottom: `1px solid ${theme.border}`,
                    display: "flex",
                    gap: "8px"
                }}>
                    <button
                        onClick={() => setActiveTab("all")}
                        style={{ 
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: activeTab === "all" ? "bold" : "normal",
                            background: activeTab === "all" ? theme.primary : theme.surfaceHover,
                            color: activeTab === "all" ? "white" : theme.text
                        }}
                    >
                        {t("allProducts")} ({totalCount})
                    </button>
                    <button
                        onClick={() => setActiveTab("pending")}
                        style={{ 
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: activeTab === "pending" ? "bold" : "normal",
                            background: activeTab === "pending" ? theme.warning : theme.surfaceHover,
                            color: activeTab === "pending" ? "white" : theme.text
                        }}
                    >
                        {t("pendingChain")} ({pendingCount})
                    </button>
                    <button
                        onClick={() => setActiveTab("on_chain")}
                        style={{ 
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            fontWeight: activeTab === "on_chain" ? "bold" : "normal",
                            background: activeTab === "on_chain" ? theme.success : theme.surfaceHover,
                            color: activeTab === "on_chain" ? "white" : theme.text
                        }}
                    >
                        {t("onChain")} ({onChainCount})
                    </button>
                </div>

                {products.length === 0 ? (
                    <div style={{ padding: "60px 20px", textAlign: "center", borderBottom: `2px dashed ${theme.border}` }}>
                        <div style={{ fontSize: "64px", marginBottom: "16px" }}>📦</div>
                        <h2 style={{ fontSize: "20px", margin: "0 0 8px 0", color: theme.text }}>{t("noProducts")}</h2>
                        <p style={{ color: theme.textSecondary, margin: "0 0 8px 0" }}>
                            {activeTab === "all"
                                ? t("noProductsTip")
                                : activeTab === "pending"
                                ? t("noPendingTip")
                                : t("noOnChainTip")}
                        </p>
                        <p style={{ color: theme.textSecondary, fontSize: "14px", margin: "0 0 16px 0" }}>
                            {t("tip")}
                        </p>
                        {activeTab === "all" && (
                            <button
                                onClick={() => setShowCreateProduct(true)}
                                style={{ 
                                    background: theme.primary, 
                                    color: "white", 
                                    border: "none",
                                    padding: "10px 20px",
                                    borderRadius: "8px",
                                    fontSize: "16px",
                                    cursor: "pointer"
                                }}
                            >
                                {t("publishProduct")}
                            </button>
                        )}
                    </div>
                ) : (
                    <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse" }}>
                            <thead>
                                <tr style={{ borderBottom: `2px solid ${theme.border}` }}>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "bold", color: theme.text }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedIds.length === products.length && products.length > 0}
                                            onChange={handleSelectAll}
                                            style={{ cursor: "pointer" }}
                                        />
                                    </th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "bold", color: theme.text }}>{t("productName")}</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "bold", color: theme.text }}>{t("category")}</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "bold", color: theme.text }}>{t("extendedFields")}</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "bold", color: theme.text }}>{t("status")}</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "bold", color: theme.text }}>{t("qrcodeCount")}</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "bold", color: theme.text }}>{t("createTime")}</th>
                                    <th style={{ padding: "12px 16px", textAlign: "left", fontWeight: "bold", color: theme.text }}>{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {products.map((product: Product) => (
                                    <tr key={product.id} style={{ borderBottom: `1px solid ${theme.borderLight}` }}>
                                        <td style={{ padding: "12px 16px" }}>
                                            <input
                                                type="checkbox"
                                                checked={selectedIds.includes(product.id)}
                                                onChange={() => handleToggleSelect(product.id)}
                                                style={{ cursor: "pointer" }}
                                            />
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                                <div style={{ 
                                                    width: "24px", 
                                                    height: "24px", 
                                                    borderRadius: "6px", 
                                                    background: `${theme.primary}20`,
                                                    display: "flex", 
                                                    alignItems: "center", 
                                                    justifyContent: "center"
                                                }}>
                                                    <span style={{ fontWeight: "bold", color: theme.primary, fontSize: "12px" }}>
                                                        {product.name.charAt(0)}
                                                    </span>
                                                </div>
                                                <span style={{ fontWeight: "medium", color: theme.text }}>{product.name}</span>
                                            </div>
                                        </td>
                                        <td style={{ padding: "12px 16px", color: theme.text }}>{product.category}</td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <span style={{ 
                                                padding: "2px 8px", 
                                                borderRadius: "4px", 
                                                background: theme.surfaceHover,
                                                fontSize: "12px",
                                                color: theme.textSecondary
                                            }}>
                                                {product.fields.length} {t("fieldValue")}
                                            </span>
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            {product.status === 'pending' && (
                                                <span style={{ 
                                                    padding: "2px 8px", 
                                                    borderRadius: "4px", 
                                                    background: "#fef3c7",
                                                    color: "#d97706",
                                                    fontSize: "12px",
                                                    border: "1px solid #f59e0b"
                                                }}>{t("pendingChain")}</span>
                                            )}
                                            {product.status === 'on_chain' && (
                                                <span style={{ 
                                                    padding: "2px 8px", 
                                                    borderRadius: "4px", 
                                                    background: "#d1fae5",
                                                    color: "#059669",
                                                    fontSize: "12px",
                                                    border: "1px solid #10b981"
                                                }}>{t("onChain")}</span>
                                            )}
                                            {product.status === 'processing' && (
                                                <span style={{ 
                                                    padding: "2px 8px", 
                                                    borderRadius: "4px", 
                                                    background: "#dbeafe",
                                                    color: "#1d4ed8",
                                                    fontSize: "12px",
                                                    border: "1px solid #3b82f6"
                                                }}>{t("processing")}</span>
                                            )}
                                            {product.status === 'failed' && (
                                                <span style={{ 
                                                    padding: "2px 8px", 
                                                    borderRadius: "4px", 
                                                    background: "#fee2e2",
                                                    color: "#b91c1c",
                                                    fontSize: "12px",
                                                    border: "1px solid #ef4444"
                                                }}>Failed</span>
                                            )}
                                        </td>
                                        <td style={{ padding: "12px 16px", color: theme.text }}>
                                            {product.qrcodeCount}
                                        </td>
                                        <td style={{ padding: "12px 16px", color: theme.textSecondary }}>
                                            {new Date(product.createdAt).toLocaleString()}
                                        </td>
                                        <td style={{ padding: "12px 16px" }}>
                                            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                                                <button
                                                    onClick={() => setSelectedProduct(product)}
                                                    style={{ 
                                                        padding: "4px 10px",
                                                        borderRadius: "4px",
                                                        border: "none",
                                                        cursor: "pointer",
                                                        fontSize: "12px",
                                                        background: theme.surfaceHover,
                                                        color: theme.text
                                                    }}
                                                >{t("detail")}</button>
                                                {product.status === 'pending' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleUploadToChain(product.id)}
                                                            style={{ 
                                                                padding: "4px 10px",
                                                                borderRadius: "4px",
                                                                border: "none",
                                                                cursor: "pointer",
                                                                fontSize: "12px",
                                                                background: theme.primary,
                                                                color: "white"
                                                            }}
                                                        >{t("upload")}</button>
                                                        <button
                                                            onClick={() => handleDeleteProduct(product.id)}
                                                            style={{ 
                                                                padding: "4px 10px",
                                                                borderRadius: "4px",
                                                                cursor: "pointer",
                                                                fontSize: "12px",
                                                                background: "#fee2e2",
                                                                color: theme.error,
                                                                border: `1px solid ${theme.error}60`
                                                            }}
                                                        >{t("delete")}</button>
                                                    </>
                                                )}
                                                {product.status === 'on_chain' && (
                                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                                                        <span style={{ fontSize: "11px", color: theme.textSecondary }}>
                                                            {t("qrcodeProgress")}: {product.qrcodeCount} / {product.quantity}
                                                        </span>
                                                        <button
                                                            onClick={() => {
                                                                const remaining = product.quantity - product.qrcodeCount;
                                                                if (remaining <= 0) {
                                                                    alert(t("allQrcodesGenerated"));
                                                                    return;
                                                                }
                                                                const count = prompt(`${t("enterQrcodeCount")} (${t("remaining")}: ${remaining})`, remaining.toString());
                                                                if (!count) return;
                                                                const numCount = parseInt(count);
                                                                if (isNaN(numCount) || numCount <= 0) {
                                                                    alert(t("invalidCount"));
                                                                    return;
                                                                }
                                                                const actualCount = Math.min(numCount, remaining);
                                                                const qrcodes = mockStore.createBatchQRCode(product.id, actualCount);
                                                                const urls = qrcodes.map(q => `${window.location.origin}/verify/${q.id}`).join("\n");
                                                                navigator.clipboard.writeText(urls);
                                                                alert(`${t("batchQrcodeGenerated")}\n\n${t("generatedCount")}: ${qrcodes.length}\n\n${t("qrcodeUrls")}:\n${urls}\n\n✅ URL列表已复制到剪贴板`);
                                                                loadProducts();
                                                            }}
                                                            style={{ 
                                                                padding: "4px 10px",
                                                                borderRadius: "4px",
                                                                border: "none",
                                                                cursor: "pointer",
                                                                fontSize: "12px",
                                                                background: theme.success,
                                                                color: "white"
                                                            }}
                                                        >{t("batchGenerateQRCode")}</button>
                                                    </div>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}