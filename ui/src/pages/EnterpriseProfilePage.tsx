import { useState, useEffect } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useNavigate } from "react-router-dom";
import { ClipLoader } from "react-spinners";
import { WalletDropdown } from "../components/WalletDropdown";
import { type Enterprise } from "../store/mockStore";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useBlockchainService } from "../services/blockchain";

export function EnterpriseProfilePage() {
    const currentAccount = useCurrentAccount();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [saved, setSaved] = useState(false);
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { getEnterpriseFromChain } = useBlockchainService();

    useEffect(() => {
        if (!currentAccount) {
            navigate("/");
            return;
        }

        const loadEnterprise = async () => {
            const chainEnterprise = await getEnterpriseFromChain(currentAccount.address);
            if (chainEnterprise) {
                setEnterprise(chainEnterprise);
                setName(chainEnterprise.name);
                setDescription(chainEnterprise.description);
            }
            setLoading(false);
        };

        loadEnterprise();
    }, [currentAccount, navigate, getEnterpriseFromChain]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!enterprise) return;

        setEnterprise({ ...enterprise, name, description });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
    };

    const handleBack = () => {
        navigate("/");
    };

    if (loading) {
        return (
            <div style={{ minHeight: "100vh", background: theme.background }}>
                <header style={{ 
                    position: "sticky",
                    top: 0,
                    padding: "12px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: `1px solid ${theme.border}`,
                    background: theme.surface,
                    zIndex: 100
                }}>
                    <h1 style={{ margin: 0, fontSize: "20px", color: theme.text }}>{t("title")}</h1>
                    <WalletDropdown enterprise={null} />
                </header>
                <main style={{ padding: "40px 20px", minHeight: "500px" }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
                        <ClipLoader size={40} color={theme.primary} />
                    </div>
                </main>
            </div>
        );
    }

    if (!enterprise) {
        return (
            <div style={{ minHeight: "100vh", background: theme.background }}>
                <header style={{ 
                    position: "sticky",
                    top: 0,
                    padding: "12px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    borderBottom: `1px solid ${theme.border}`,
                    background: theme.surface,
                    zIndex: 100
                }}>
                    <h1 style={{ margin: 0, fontSize: "20px", color: theme.text }}>{t("title")}</h1>
                    <WalletDropdown enterprise={null} />
                </header>
                <main style={{ padding: "40px 20px", minHeight: "500px" }}>
                    <div style={{ textAlign: "center" }}>
                        <h2 style={{ fontSize: "24px", color: theme.textSecondary }}>{t("enterpriseNotFound")}</h2>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div style={{ minHeight: "100vh", background: theme.background }}>
            <header style={{ 
                position: "sticky",
                top: 0,
                padding: "12px 20px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderBottom: `1px solid ${theme.border}`,
                background: theme.surface,
                zIndex: 100,
                boxShadow: theme.shadow
            }}>
                <h1 style={{ margin: 0, fontSize: "20px", color: theme.text }}>{t("title")}</h1>
                <WalletDropdown enterprise={enterprise} />
            </header>

            <main style={{ padding: "20px" }}>
                <div style={{ maxWidth: 600, margin: "0 auto" }}>
                    <button
                        onClick={handleBack}
                        style={{
                            padding: "8px 16px",
                            borderRadius: "6px",
                            border: `1px solid ${theme.border}`,
                            background: theme.surface,
                            color: theme.text,
                            cursor: "pointer",
                            fontSize: "14px",
                            marginBottom: "20px"
                        }}
                    >
                        ← {t("back")}
                    </button>

                    <div style={{ 
                        background: theme.surface,
                        borderRadius: "12px",
                        padding: "24px",
                        border: `1px solid ${theme.border}`
                    }}>
                        <h2 style={{ fontSize: "20px", color: theme.text, marginBottom: "24px" }}>
                            {t("editEnterpriseProfile")}
                        </h2>

                        {saved && (
                            <div style={{
                                padding: "12px",
                                borderRadius: "6px",
                                background: "#d1fae5",
                                color: "#059669",
                                marginBottom: "16px",
                                textAlign: "center",
                                fontWeight: "bold"
                            }}>
                                ✅ {t("savedSuccessfully")}
                            </div>
                        )}

                        <form onSubmit={handleSubmit}>
                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ 
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    color: theme.text,
                                    marginBottom: "8px"
                                }}>
                                    {t("enterpriseName")} *
                                </label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    required
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: `1px solid ${theme.border}`,
                                        background: theme.background,
                                        color: theme.text,
                                        fontSize: "14px",
                                        outline: "none",
                                        boxSizing: "border-box"
                                    }}
                                    placeholder={t("enterEnterpriseName")}
                                />
                            </div>

                            <div style={{ marginBottom: "16px" }}>
                                <label style={{ 
                                    display: "block",
                                    fontSize: "14px",
                                    fontWeight: "bold",
                                    color: theme.text,
                                    marginBottom: "8px"
                                }}>
                                    {t("description")}
                                </label>
                                <textarea
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    style={{
                                        width: "100%",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        border: `1px solid ${theme.border}`,
                                        background: theme.background,
                                        color: theme.text,
                                        fontSize: "14px",
                                        outline: "none",
                                        resize: "vertical",
                                        boxSizing: "border-box"
                                    }}
                                    placeholder={t("enterDescription")}
                                />
                            </div>

                            <div style={{ marginBottom: "24px", padding: "16px", background: theme.background, borderRadius: "8px" }}>
                                <div style={{ fontSize: "12px", color: theme.textSecondary }}>
                                    <div>{t("walletAddress")}: {enterprise.owner}</div>
                                    <div>{t("createdAt")}: {new Date(enterprise.createdAt).toLocaleString()}</div>
                                    <div>{t("productCount")}: {enterprise.productCount}</div>
                                </div>
                            </div>

                            <button
                                type="submit"
                                style={{
                                    width: "100%",
                                    padding: "12px",
                                    borderRadius: "8px",
                                    border: "none",
                                    background: theme.primary,
                                    color: "white",
                                    cursor: "pointer",
                                    fontSize: "16px",
                                    fontWeight: "bold"
                                }}
                            >
                                {t("save")}
                            </button>
                        </form>
                    </div>
                </div>
            </main>
        </div>
    );
}