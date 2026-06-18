import { useState } from "react";
import { type Enterprise, type DynamicField } from "../store/mockStore";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useBlockchainService } from "../services/blockchain";

interface CreateProductProps {
    enterprise: Enterprise;
    onCreated: () => void;
    onClose: () => void;
}

export function CreateProduct({ enterprise, onCreated, onClose }: CreateProductProps) {
    const [name, setName] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [fields, setFields] = useState<DynamicField[]>([]);
    const [showAddField, setShowAddField] = useState(false);
    const [newFieldName, setNewFieldName] = useState("");
    const [newFieldValue, setNewFieldValue] = useState("");
    const [newFieldType, setNewFieldType] = useState<DynamicField['type']>("text");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { createProduct, uploadProductToChain } = useBlockchainService();

    const categoryList = [
        { key: t("food"), value: "食品" },
        { key: t("clothing"), value: "服装" },
        { key: t("electronics"), value: "电子产品" },
        { key: t("cosmetics"), value: "化妆品" },
        { key: t("agricultural"), value: "农产品" },
        { key: t("medicine"), value: "医药" },
        { key: t("other"), value: "其他" },
    ];

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

        setFields([...fields, newField]);
        setNewFieldName("");
        setNewFieldValue("");
        setShowAddField(false);
    };

    const handleRemoveField = (fieldId: string) => {
        setFields(fields.filter(f => f.id !== fieldId));
    };

    const handleSubmit = async (uploadToChain: boolean) => {
        if (!name.trim() || !category || !description.trim()) {
            alert(t("pleaseFillBasic"));
            return;
        }

        setIsSubmitting(true);

        try {
            const result = await createProduct({
                enterpriseId: enterprise.id,
                enterpriseVersion: "1",
                name,
                description,
                category,
                fields,
            });

            if (uploadToChain && result.data) {
                await uploadProductToChain(result.data.id);
            }

            alert(uploadToChain ? t("productCreated") : t("productSaved"));
            onCreated();
            onClose();
        } catch (error) {
            console.error("Failed to create product:", error);
            alert(t("createFailed"));
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ 
            padding: "24px", 
            maxWidth: 700, 
            margin: "0 auto",
            background: theme.surface,
            borderRadius: "12px",
            boxShadow: theme.shadow
        }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                <h2 style={{ fontSize: "22px", margin: 0, color: theme.text }}>{t("newProduct")}</h2>
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
                    <input
                        type="text"
                        placeholder={t("productName")}
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                        style={{ 
                            padding: "10px 12px",
                            borderRadius: "6px",
                            border: `1px solid ${theme.border}`,
                            fontSize: "14px",
                            background: theme.surface,
                            color: theme.text,
                            outline: "none"
                        }}
                    />

                    <select
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        disabled={isSubmitting}
                        style={{ 
                            padding: "10px 12px", 
                            borderRadius: "6px", 
                            border: `1px solid ${theme.border}`,
                            fontSize: "14px",
                            background: theme.surface,
                            color: theme.text,
                            cursor: "pointer"
                        }}
                    >
                        <option value="">{t("selectCategory")}</option>
                        {categoryList.map((cat) => (
                            <option key={cat.value} value={cat.value}>{cat.key}</option>
                        ))}
                    </select>

                    <textarea
                        placeholder={t("productDescription")}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                        rows={3}
                        style={{ 
                            padding: "10px 12px", 
                            borderRadius: "6px", 
                            border: `1px solid ${theme.border}`,
                            fontSize: "14px",
                            background: theme.surface,
                            color: theme.text,
                            resize: "vertical",
                            outline: "none"
                        }}
                    />

                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <label style={{ color: theme.textSecondary, fontSize: "14px" }}>{t("productQuantity")}</label>
                        <input
                            type="number"
                            min="1"
                            max="10000"
                            value={quantity}
                            onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                            disabled={isSubmitting}
                            style={{ 
                                padding: "10px 12px",
                                borderRadius: "6px",
                                border: `1px solid ${theme.border}`,
                                fontSize: "14px",
                                background: theme.surface,
                                color: theme.text,
                                width: "120px",
                                outline: "none"
                            }}
                        />
                        <span style={{ color: theme.textSecondary, fontSize: "12px" }}>{t("quantityTip")}</span>
                    </div>
                </div>
            </div>

            <div style={{ padding: "16px", background: theme.background, borderRadius: "8px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <h3 style={{ fontSize: "16px", margin: 0, color: theme.text }}>{t("extendedFieldsOptional")}</h3>
                    <button 
                        onClick={() => setShowAddField(!showAddField)}
                        style={{
                            padding: "6px 12px",
                            borderRadius: "6px",
                            border: "none",
                            cursor: "pointer",
                            fontSize: "14px",
                            background: theme.primary,
                            color: "white"
                        }}
                    >
                        {showAddField ? t("close") : t("addField")}
                    </button>
                </div>

                {showAddField && (
                    <div style={{ padding: "12px", marginBottom: "12px", border: `1px dashed ${theme.border}`, borderRadius: "8px", background: theme.surface }}>
                        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
                            <input
                                type="text"
                                placeholder={t("fieldName")}
                                value={newFieldName}
                                onChange={(e) => setNewFieldName(e.target.value)}
                                style={{ 
                                    width: "150px",
                                    padding: "8px 10px",
                                    borderRadius: "6px",
                                    border: `1px solid ${theme.border}`,
                                    fontSize: "14px",
                                    background: theme.surface,
                                    color: theme.text,
                                    outline: "none"
                                }}
                            />
                            <select
                                value={newFieldType}
                                onChange={(e) => setNewFieldType(e.target.value as DynamicField['type'])}
                                style={{ 
                                    padding: "8px 10px", 
                                    borderRadius: "6px", 
                                    border: `1px solid ${theme.border}`,
                                    fontSize: "14px",
                                    background: theme.surface,
                                    color: theme.text,
                                    cursor: "pointer"
                                }}
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
                                    style={{ 
                                        flex: 1, 
                                        minWidth: "200px",
                                        padding: "8px 10px",
                                        borderRadius: "6px",
                                        border: `1px solid ${theme.border}`,
                                        fontSize: "14px",
                                        background: theme.surface,
                                        color: theme.text,
                                        outline: "none",
                                        cursor: "pointer"
                                    }}
                                />
                            ) : newFieldType === 'number' ? (
                                <input
                                    type="number"
                                    placeholder={t("fieldValue")}
                                    value={newFieldValue}
                                    onChange={(e) => setNewFieldValue(e.target.value)}
                                    style={{ 
                                        flex: 1, 
                                        minWidth: "200px",
                                        padding: "8px 10px",
                                        borderRadius: "6px",
                                        border: `1px solid ${theme.border}`,
                                        fontSize: "14px",
                                        background: theme.surface,
                                        color: theme.text,
                                        outline: "none"
                                    }}
                                />
                            ) : (
                                <input
                                    type="text"
                                    placeholder={t("fieldValue")}
                                    value={newFieldValue}
                                    onChange={(e) => setNewFieldValue(e.target.value)}
                                    style={{ 
                                        flex: 1, 
                                        minWidth: "200px",
                                        padding: "8px 10px",
                                        borderRadius: "6px",
                                        border: `1px solid ${theme.border}`,
                                        fontSize: "14px",
                                        background: theme.surface,
                                        color: theme.text,
                                        outline: "none"
                                    }}
                                />
                            )}
                            <button 
                                onClick={handleAddField}
                                style={{
                                    padding: "8px 12px",
                                    borderRadius: "6px",
                                    border: "none",
                                    cursor: "pointer",
                                    fontSize: "14px",
                                    background: theme.success,
                                    color: "white"
                                }}
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
                                <span style={{ flex: 1, color: theme.text }}>{field.value}</span>
                                <button 
                                    onClick={() => handleRemoveField(field.id)}
                                    style={{
                                        padding: "4px 8px",
                                        borderRadius: "4px",
                                        border: `1px solid ${theme.error}`,
                                        cursor: "pointer",
                                        fontSize: "12px",
                                        background: "transparent",
                                        color: theme.error
                                    }}
                                >{t("delete")}</button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end", marginTop: "20px" }}>
                <button 
                    onClick={onClose}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: `1px solid ${theme.border}`,
                        cursor: "pointer",
                        fontSize: "14px",
                        background: theme.surface,
                        color: theme.text
                    }}
                >{t("cancel")}</button>
                <button 
                    onClick={() => handleSubmit(false)} 
                    disabled={isSubmitting}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        background: theme.surfaceHover,
                        color: theme.text,
                        opacity: isSubmitting ? 0.5 : 1
                    }}
                >
                    {isSubmitting ? t("saved") : t("saveDraft")}
                </button>
                <button 
                    onClick={() => handleSubmit(true)} 
                    disabled={isSubmitting}
                    style={{
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: "none",
                        cursor: "pointer",
                        fontSize: "14px",
                        background: theme.primary,
                        color: "white",
                        opacity: isSubmitting ? 0.5 : 1
                    }}
                >
                    {isSubmitting ? t("uploading") : t("saveAndUpload")}
                </button>
            </div>
        </div>
    );
}