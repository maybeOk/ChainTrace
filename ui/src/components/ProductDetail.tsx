import { useState, useEffect } from "react";
import QRCode from "qrcode";
import { mockStore, type Product, type DynamicField, type QRCodeRecord } from "../store/mockStore";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useBlockchainService } from "../services/blockchain";

interface ProductDetailProps {
    product: Product;
    onClose: () => void;
    onUpdate: () => void;
}

export function ProductDetail({ product, onClose, onUpdate }: ProductDetailProps) {
    const [editingName, setEditingName] = useState(false);
    const [editingCategory, setEditingCategory] = useState(false);
    const [editingDescription, setEditingDescription] = useState(false);
    const [editNameValue, setEditNameValue] = useState(product.name);
    const [editCategoryValue, setEditCategoryValue] = useState(product.category);
    const [editDescriptionValue, setEditDescriptionValue] = useState(product.description);
    const [fields, setFields] = useState<DynamicField[]>([...product.fields]);
    const [showAddField, setShowAddField] = useState(false);
    const [newFieldName, setNewFieldName] = useState("");
    const [newFieldValue, setNewFieldValue] = useState("");
    const [newFieldType, setNewFieldType] = useState<DynamicField['type']>("text");
    const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
    const [editFieldValue, setEditFieldValue] = useState("");
    const [qrcodes, setQrcodes] = useState<QRCodeRecord[]>([]);
    const [qrcodeImages, setQrcodeImages] = useState<Map<string, string>>(new Map());
    const [showQrcodes, setShowQrcodes] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(6);
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { uploadProductToChain } = useBlockchainService();

    useEffect(() => {
        const codes = mockStore.getQRCodeByProductId(product.id);
        setQrcodes(codes);
        generateQrcodeImages(codes);
        setCurrentPage(1);
    }, [product.id]);

    useEffect(() => {
        setCurrentPage(1);
    }, [pageSize]);

    const generateQrcodeImages = async (codes: QRCodeRecord[]) => {
        const images = new Map<string, string>();
        for (const code of codes) {
            const url = `${window.location.origin}/verify/${code.id}`;
            try {
                const dataUrl = await QRCode.toDataURL(url, {
                    width: 128,
                    margin: 2,
                });
                images.set(code.id, dataUrl);
            } catch (e) {
                console.error("Failed to generate QR code:", e);
            }
        }
        setQrcodeImages(images);
    };

    const handleSaveBasic = () => {
        mockStore.updateProduct(product.id, {
            name: editNameValue,
            category: editCategoryValue,
            description: editDescriptionValue,
        });
        setEditingName(false);
        setEditingCategory(false);
        setEditingDescription(false);
        onUpdate();
        alert(t("productSaved"));
    };

    const handleAddField = () => {
        if (!newFieldName.trim()) {
            alert(t("pleaseEnterFieldName"));
            return;
        }

        const newField: DynamicField = {
            id: `field-${Date.now()}`,
            name: newFieldName,
            value: newFieldValue,
            type: newFieldType,
        };

        mockStore.addProductField(product.id, {
            name: newFieldName,
            value: newFieldValue,
            type: newFieldType,
        });

        setFields([...fields, newField]);
        setNewFieldName("");
        setNewFieldValue("");
        setShowAddField(false);
        onUpdate();
        alert(t("fieldAdded"));
    };

    const handleRemoveField = (fieldId: string) => {
        if (!confirm(t("confirmDeleteField"))) {
            return;
        }

        mockStore.removeProductField(product.id, fieldId);
        setFields(fields.filter(f => f.id !== fieldId));
        onUpdate();
    };

    const handleStartEditField = (field: DynamicField) => {
        setEditingFieldId(field.id);
        setEditFieldValue(field.value);
    };

    const handleSaveField = (fieldId: string) => {
        mockStore.updateProductField(product.id, fieldId, { value: editFieldValue });
        setFields(fields.map(f => f.id === fieldId ? { ...f, value: editFieldValue } : f));
        setEditingFieldId(null);
        setEditFieldValue("");
        onUpdate();
    };

    const handleGenerateQRCode = () => {
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
        const newQrcodes = mockStore.createBatchQRCode(product.id, actualCount);
        const urls = newQrcodes.map(q => `${window.location.origin}/verify/${q.id}`).join("\n");
        navigator.clipboard.writeText(urls);
        alert(`${t("batchQrcodeGenerated")}\n\n${t("generatedCount")}: ${newQrcodes.length}\n\n${t("qrcodeUrls")}:\n${urls}\n\n✅ URL列表已复制到剪贴板`);
        onUpdate();
    };

    const handleCopyLink = async (url: string) => {
        await navigator.clipboard.writeText(url);
        alert(t("copied"));
    };

    const handleUploadToChain = async () => {
        await uploadProductToChain(product.id);
        alert(t("scanning"));
        onUpdate();
    };

    const getStatusBadge = (status: Product['status']) => {
        const baseStyle = { padding: "2px 8px", borderRadius: "4px", fontSize: "12px", border: "1px solid" };
        switch (status) {
            case 'pending':
                return <span style={{ ...baseStyle, background: "#fef3c7", color: "#d97706", borderColor: "#f59e0b" }}>{t("pendingChain")}</span>;
            case 'on_chain':
                return <span style={{ ...baseStyle, background: "#d1fae5", color: "#059669", borderColor: "#10b981" }}>{t("onChain")}</span>;
            case 'processing':
                return <span style={{ ...baseStyle, background: "#dbeafe", color: "#1d4ed8", borderColor: "#3b82f6" }}>{t("processing")}</span>;
            case 'failed':
                return <span style={{ ...baseStyle, background: "#fee2e2", color: "#b91c1c", borderColor: "#ef4444" }}>{t("failed")}</span>;
        }
    };

    const getQrcodeStatusBadge = (isClaimed: boolean) => {
        const baseStyle = { padding: "2px 6px", borderRadius: "4px", fontSize: "10px", border: "1px solid" };
        if (isClaimed) {
            return <span style={{ ...baseStyle, background: "#fee2e2", color: "#b91c1c", borderColor: "#ef4444" }}>{t("claimed")}</span>;
        }
        return <span style={{ ...baseStyle, background: "#d1fae5", color: "#059669", borderColor: "#10b981" }}>{t("unclaimed")}</span>;
    };

    return (
        <div style={{ padding: "24px", maxWidth: 1000, margin: "0 auto", background: theme.surface, borderRadius: "12px", boxShadow: theme.shadow }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "22px", margin: 0, color: theme.text }}>{t("productDetail")}</h2>
                <button 
                    onClick={onClose}
                    style={{
                        padding: "6px 12px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        background: theme.surfaceHover,
                        color: theme.textSecondary
                    }}
                >{t("close")}</button>
            </div>

            <div style={{ padding: "16px", marginBottom: "16px", background: theme.background, borderRadius: "8px" }}>
                <h3 style={{ fontSize: "16px", margin: "0 0 12px 0", color: theme.text }}>{t("basicInfo")}</h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ width: "120px", fontWeight: "bold", color: theme.text }}>{t("productName")}:</span>
                        {editingName ? (
                            <>
                                <input
                                    value={editNameValue}
                                    onChange={(e) => setEditNameValue(e.target.value)}
                                    style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, fontSize: "14px", background: theme.surface, color: theme.text, outline: "none" }}
                                />
                                <button 
                                    onClick={handleSaveBasic}
                                    style={{ padding: "6px 10px", borderRadius: "4px", border: "none", cursor: "pointer", fontSize: "12px", background: theme.success, color: "white" }}
                                >{t("saveChanges")}</button>
                                <button 
                                    onClick={() => setEditingName(false)}
                                    style={{ padding: "6px 10px", borderRadius: "4px", border: `1px solid ${theme.border}`, cursor: "pointer", fontSize: "12px", background: theme.surface, color: theme.text }}
                                >{t("cancel")}</button>
                            </>
                        ) : (
                            <>
                                <span style={{ color: theme.text }}>{product.name}</span>
                                <button 
                                    onClick={() => setEditingName(true)}
                                    style={{ padding: "6px 10px", borderRadius: "4px", border: `1px solid ${theme.border}`, cursor: "pointer", fontSize: "12px", background: theme.surface, color: theme.text }}
                                >{t("edit")}</button>
                            </>
                        )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ width: "120px", fontWeight: "bold", color: theme.text }}>{t("category")}:</span>
                        {editingCategory ? (
                            <>
                                <input
                                    value={editCategoryValue}
                                    onChange={(e) => setEditCategoryValue(e.target.value)}
                                    style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, fontSize: "14px", background: theme.surface, color: theme.text, outline: "none" }}
                                />
                                <button 
                                    onClick={handleSaveBasic}
                                    style={{ padding: "6px 10px", borderRadius: "4px", border: "none", cursor: "pointer", fontSize: "12px", background: theme.success, color: "white" }}
                                >{t("saveChanges")}</button>
                                <button 
                                    onClick={() => setEditingCategory(false)}
                                    style={{ padding: "6px 10px", borderRadius: "4px", border: `1px solid ${theme.border}`, cursor: "pointer", fontSize: "12px", background: theme.surface, color: theme.text }}
                                >{t("cancel")}</button>
                            </>
                        ) : (
                            <>
                                <span style={{ color: theme.text }}>{product.category}</span>
                                <button 
                                    onClick={() => setEditingCategory(true)}
                                    style={{ padding: "6px 10px", borderRadius: "4px", border: `1px solid ${theme.border}`, cursor: "pointer", fontSize: "12px", background: theme.surface, color: theme.text }}
                                >{t("edit")}</button>
                            </>
                        )}
                    </div>

                    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
                        <span style={{ width: "120px", fontWeight: "bold", marginTop: "4px", color: theme.text }}>{t("productDescription")}:</span>
                        {editingDescription ? (
                            <>
                                <textarea
                                    value={editDescriptionValue}
                                    onChange={(e) => setEditDescriptionValue(e.target.value)}
                                    rows={3}
                                    style={{ flex: 1, padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, fontSize: "14px", background: theme.surface, color: theme.text, resize: "vertical", outline: "none" }}
                                />
                                <button 
                                    onClick={handleSaveBasic}
                                    style={{ padding: "6px 10px", borderRadius: "4px", border: "none", cursor: "pointer", fontSize: "12px", background: theme.success, color: "white", marginTop: "4px" }}
                                >{t("saveChanges")}</button>
                                <button 
                                    onClick={() => setEditingDescription(false)}
                                    style={{ padding: "6px 10px", borderRadius: "4px", border: `1px solid ${theme.border}`, cursor: "pointer", fontSize: "12px", background: theme.surface, color: theme.text, marginTop: "4px" }}
                                >{t("cancel")}</button>
                            </>
                        ) : (
                            <>
                                <span style={{ color: theme.text }}>{product.description}</span>
                                <button 
                                    onClick={() => setEditingDescription(true)}
                                    style={{ padding: "6px 10px", borderRadius: "4px", border: `1px solid ${theme.border}`, cursor: "pointer", fontSize: "12px", background: theme.surface, color: theme.text }}
                                >{t("edit")}</button>
                            </>
                        )}
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ width: "120px", fontWeight: "bold", color: theme.text }}>{t("status")}:</span>
                        {getStatusBadge(product.status)}
                    </div>
                </div>
            </div>

            <div style={{ padding: "16px", marginBottom: "16px", background: theme.background, borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "16px", margin: 0, color: theme.text }}>{t("extendedFieldsOptional")}</h3>
                    <button 
                        onClick={() => setShowAddField(!showAddField)}
                        style={{ padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px", background: theme.primary, color: "white" }}
                    >
                        {showAddField ? t("close") : t("addField")}
                    </button>
                </div>

                {showAddField && (
                    <div style={{ padding: "12px", marginBottom: "12px", border: `1px dashed ${theme.border}`, borderRadius: "8px", background: theme.surface }}>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <input
                                placeholder={t("fieldName")}
                                value={newFieldName}
                                onChange={(e) => setNewFieldName(e.target.value)}
                                style={{ width: "150px", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, fontSize: "14px", background: theme.surface, color: theme.text, outline: "none" }}
                            />
                            <select
                                value={newFieldType}
                                onChange={(e) => setNewFieldType(e.target.value as DynamicField['type'])}
                                style={{ padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, fontSize: "14px", background: theme.surface, color: theme.text, cursor: "pointer" }}
                            >
                                <option value="text">{t("text")}</option>
                                <option value="date">{t("date")}</option>
                                <option value="number">{t("number")}</option>
                            </select>
                            {newFieldType === 'date' ? (
                                <input
                                    type="date"
                                    value={newFieldValue}
                                    onChange={(e) => setNewFieldValue(e.target.value)}
                                    style={{ flex: 1, minWidth: "200px", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, fontSize: "14px", background: theme.surface, color: theme.text, outline: "none", cursor: "pointer" }}
                                />
                            ) : newFieldType === 'number' ? (
                                <input
                                    type="number"
                                    placeholder={t("fieldValue")}
                                    value={newFieldValue}
                                    onChange={(e) => setNewFieldValue(e.target.value)}
                                    style={{ flex: 1, minWidth: "200px", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, fontSize: "14px", background: theme.surface, color: theme.text, outline: "none" }}
                                />
                            ) : (
                                <input
                                    type="text"
                                    placeholder={t("fieldValue")}
                                    value={newFieldValue}
                                    onChange={(e) => setNewFieldValue(e.target.value)}
                                    style={{ flex: 1, minWidth: "200px", padding: "8px 10px", borderRadius: "6px", border: `1px solid ${theme.border}`, fontSize: "14px", background: theme.surface, color: theme.text, outline: "none" }}
                                />
                            )}
                            <button 
                                onClick={handleAddField}
                                style={{ padding: "8px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px", background: theme.success, color: "white" }}
                            >{t("addField")}</button>
                        </div>
                    </div>
                )}

                {fields.length === 0 ? (
                    <p style={{ color: theme.textSecondary, margin: 0 }}>{t("noProductsTip")}</p>
                ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        {fields.map((field) => (
                            <div key={field.id} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", background: theme.surface, borderRadius: "6px" }}>
                                <span style={{ fontWeight: "bold", width: "120px", color: theme.text }}>{field.name}:</span>
                                {editingFieldId === field.id ? (
                                    <>
                                        {field.type === 'date' ? (
                                            <input
                                                type="date"
                                                value={editFieldValue}
                                                onChange={(e) => setEditFieldValue(e.target.value)}
                                                style={{ flex: 1, padding: "6px 8px", borderRadius: "4px", border: `1px solid ${theme.border}`, fontSize: "14px", background: theme.surface, color: theme.text, outline: "none", cursor: "pointer" }}
                                            />
                                        ) : field.type === 'number' ? (
                                            <input
                                                type="number"
                                                value={editFieldValue}
                                                onChange={(e) => setEditFieldValue(e.target.value)}
                                                style={{ flex: 1, padding: "6px 8px", borderRadius: "4px", border: `1px solid ${theme.border}`, fontSize: "14px", background: theme.surface, color: theme.text, outline: "none" }}
                                            />
                                        ) : (
                                            <input
                                                type="text"
                                                value={editFieldValue}
                                                onChange={(e) => setEditFieldValue(e.target.value)}
                                                style={{ flex: 1, padding: "6px 8px", borderRadius: "4px", border: `1px solid ${theme.border}`, fontSize: "14px", background: theme.surface, color: theme.text, outline: "none" }}
                                            />
                                        )}
                                        <button 
                                            onClick={() => handleSaveField(field.id)}
                                            style={{ padding: "4px 8px", borderRadius: "4px", border: "none", cursor: "pointer", fontSize: "12px", background: theme.success, color: "white" }}
                                        >{t("saveChanges")}</button>
                                        <button 
                                            onClick={() => setEditingFieldId(null)}
                                            style={{ padding: "4px 8px", borderRadius: "4px", border: `1px solid ${theme.border}`, cursor: "pointer", fontSize: "12px", background: theme.surface, color: theme.text }}
                                        >{t("cancel")}</button>
                                    </>
                                ) : (
                                    <>
                                        <span style={{ flex: 1, color: theme.text }}>{field.value}</span>
                                        <button 
                                            onClick={() => handleStartEditField(field)}
                                            style={{ padding: "4px 8px", borderRadius: "4px", border: `1px solid ${theme.border}`, cursor: "pointer", fontSize: "12px", background: theme.surface, color: theme.text }}
                                        >{t("edit")}</button>
                                        <button 
                                            onClick={() => handleRemoveField(field.id)}
                                            style={{ padding: "4px 8px", borderRadius: "4px", border: `1px solid ${theme.error}`, cursor: "pointer", fontSize: "12px", background: "transparent", color: theme.error }}
                                        >{t("delete")}</button>
                                    </>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {product.status === 'on_chain' && (
                <div style={{ padding: "16px", marginBottom: "16px", background: theme.background, borderRadius: "8px" }}>
                    <h3 style={{ fontSize: "16px", margin: "0 0 12px 0", color: theme.text }}>{t("chainInfo")}</h3>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                        <p style={{ margin: 0, color: theme.text }}><strong>{t("chainId")}:</strong> {product.chainId}</p>
                        <p style={{ margin: 0, color: theme.text }}><strong>{t("blockHeight")}:</strong> {product.chainHeight}</p>
                        <p style={{ margin: 0, color: theme.text }}><strong>{t("uploadTime")}:</strong> {product.onChainAt ? new Date(product.onChainAt).toLocaleString() : '-'}</p>
                    </div>
                </div>
            )}

            <div style={{ padding: "16px", marginBottom: "16px", background: theme.background, borderRadius: "8px" }}>
                <h3 style={{ fontSize: "16px", margin: "0 0 12px 0", color: theme.text }}>{t("statistics")}</h3>
                <div style={{ display: "flex", gap: "16px" }}>
                    <span style={{ padding: "4px 10px", borderRadius: "4px", border: `1px solid ${theme.border}`, fontSize: "12px", color: theme.text }}>{t("qrcodeCount")}: {product.qrcodeCount}</span>
                    <span style={{ padding: "4px 10px", borderRadius: "4px", border: `1px solid ${theme.border}`, fontSize: "12px", color: theme.text }}>{t("scanCount")}: {product.scanCount}</span>
                    <span style={{ padding: "4px 10px", borderRadius: "4px", border: `1px solid ${theme.border}`, fontSize: "12px", color: theme.text }}>{t("nftClaim")}: {product.nftClaimCount}</span>
                </div>
            </div>

            {qrcodes.length > 0 && (
                <div style={{ padding: "16px", marginBottom: "16px", background: theme.background, borderRadius: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <h3 style={{ fontSize: "16px", margin: 0, color: theme.text }}>
                            {t("generatedQrcodes")} ({qrcodes.length})
                        </h3>
                        <button 
                            onClick={() => setShowQrcodes(!showQrcodes)}
                            style={{ padding: "6px 12px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px", background: theme.primary, color: "white" }}
                        >
                            {showQrcodes ? t("hideQrcodes") : t("showQrcodes")}
                        </button>
                    </div>

                    {showQrcodes && (
                        <>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "16px" }}>
                                {(() => {
                                    const start = (currentPage - 1) * pageSize;
                                    const end = start + pageSize;
                                    const currentQrcodes = qrcodes.slice(start, end);
                                    return currentQrcodes.map((qrcode) => {
                                        const url = `${window.location.origin}/verify/${qrcode.id}`;
                                        const qrcodeImage = qrcodeImages.get(qrcode.id);
                                        return (
                                            <div 
                                                key={qrcode.id} 
                                                style={{ 
                                                    padding: "12px", 
                                                    background: theme.surface, 
                                                    borderRadius: "8px", 
                                                    border: `1px solid ${theme.border}`,
                                                    textAlign: "center"
                                                }}
                                            >
                                                <div style={{ marginBottom: "8px" }}>
                                                    {qrcodeImage ? (
                                                        <img 
                                                            src={qrcodeImage} 
                                                            alt="QR Code" 
                                                            style={{ width: "128px", height: "128px", margin: "0 auto", border: `1px solid ${theme.border}`, borderRadius: "4px" }}
                                                        />
                                                    ) : (
                                                        <div style={{ width: "128px", height: "128px", margin: "0 auto", border: `1px dashed ${theme.border}`, borderRadius: "4px", display: "flex", alignItems: "center", justifyContent: "center", color: theme.textSecondary, fontSize: "12px" }}>
                                                            {t("generating")}...
                                                        </div>
                                                    )}
                                                </div>
                                                <div style={{ fontSize: "10px", color: theme.textSecondary, marginBottom: "4px", wordBreak: "break-all", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {qrcode.id}
                                                </div>
                                                <div style={{ fontSize: "10px", color: theme.textSecondary, marginBottom: "8px" }}>
                                                    {t("scanCount")}: {qrcode.scanCount}
                                                </div>
                                                <div style={{ marginBottom: "8px" }}>
                                                    {getQrcodeStatusBadge(qrcode.isClaimed)}
                                                </div>
                                                <button 
                                                    onClick={() => handleCopyLink(url)}
                                                    style={{ 
                                                        width: "100%",
                                                        padding: "6px", 
                                                        borderRadius: "4px", 
                                                        border: `1px solid ${theme.border}`, 
                                                        cursor: "pointer", 
                                                        fontSize: "12px", 
                                                        background: theme.surface, 
                                                        color: theme.text,
                                                        wordBreak: "break-all"
                                                    }}
                                                >
                                                    🔗 {t("copyLink")}
                                                </button>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>

                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "16px", paddingTop: "12px", borderTop: `1px solid ${theme.border}` }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <span style={{ fontSize: "12px", color: theme.textSecondary }}>{t("pageSize")}:</span>
                                    <select
                                        value={pageSize}
                                        onChange={(e) => setPageSize(parseInt(e.target.value))}
                                        style={{ padding: "4px 8px", borderRadius: "4px", border: `1px solid ${theme.border}`, fontSize: "12px", background: theme.surface, color: theme.text, cursor: "pointer" }}
                                    >
                                        <option value={6}>6</option>
                                        <option value={12}>12</option>
                                        <option value={24}>24</option>
                                        <option value={50}>50</option>
                                    </select>
                                </div>

                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        style={{ 
                                            padding: "4px 10px", 
                                            borderRadius: "4px", 
                                            border: `1px solid ${theme.border}`, 
                                            cursor: currentPage === 1 ? "not-allowed" : "pointer", 
                                            fontSize: "12px", 
                                            background: currentPage === 1 ? theme.background : theme.surface, 
                                            color: currentPage === 1 ? theme.textSecondary : theme.text 
                                        }}
                                    >
                                        ← {t("prev")}
                                    </button>
                                    <span style={{ fontSize: "12px", color: theme.text }}>
                                        {t("page")} {currentPage} {t("of")} {Math.ceil(qrcodes.length / pageSize)}
                                    </span>
                                    <button 
                                        onClick={() => setCurrentPage(p => Math.min(Math.ceil(qrcodes.length / pageSize), p + 1))}
                                        disabled={currentPage === Math.ceil(qrcodes.length / pageSize)}
                                        style={{ 
                                            padding: "4px 10px", 
                                            borderRadius: "4px", 
                                            border: `1px solid ${theme.border}`, 
                                            cursor: currentPage === Math.ceil(qrcodes.length / pageSize) ? "not-allowed" : "pointer", 
                                            fontSize: "12px", 
                                            background: currentPage === Math.ceil(qrcodes.length / pageSize) ? theme.background : theme.surface, 
                                            color: currentPage === Math.ceil(qrcodes.length / pageSize) ? theme.textSecondary : theme.text 
                                        }}
                                    >
                                        {t("next")} →
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>
            )}

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                {product.status === 'pending' && (
                    <button 
                        onClick={handleUploadToChain}
                        style={{ padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px", background: theme.primary, color: "white" }}
                    >{t("upload")}</button>
                )}
                {product.status === 'on_chain' && (
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", gap: "4px" }}>
                        <span style={{ fontSize: "12px", color: theme.textSecondary }}>
                            {t("qrcodeProgress")}: {product.qrcodeCount} / {product.quantity}
                        </span>
                        <button 
                            onClick={handleGenerateQRCode}
                            style={{ padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px", background: theme.success, color: "white" }}
                        >{t("batchGenerateQRCode")}</button>
                    </div>
                )}
                <button 
                    onClick={handleSaveBasic}
                    style={{ padding: "8px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px", background: theme.surfaceHover, color: theme.text }}
                >{t("saveChanges")}</button>
                <button 
                    onClick={onClose}
                    style={{ padding: "8px 16px", borderRadius: "6px", border: `1px solid ${theme.border}`, cursor: "pointer", fontSize: "14px", background: theme.surface, color: theme.text }}
                >{t("close")}</button>
            </div>
        </div>
    );
}