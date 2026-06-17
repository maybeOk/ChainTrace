import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { QRCodeScanner } from "../components/QRCodeScanner";
import { WalletDropdown } from "../components/WalletDropdown";
import { mockStore, type Enterprise } from "../store/mockStore";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";

export function VerifyPage() {
    const currentAccount = useCurrentAccount();
    const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { id } = useParams<{ id?: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        if (currentAccount) {
            const found = mockStore.getEnterpriseByOwner(currentAccount.address) || null;
            setEnterprise(found);
        }
    }, [currentAccount]);

    const handleClearParams = () => {
        navigate("/verify");
    };

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
                {id && (
                    <div style={{ 
                        padding: "12px 16px", 
                        marginBottom: "16px", 
                        background: "#d1fae5",
                        border: "1px solid #10b981",
                        borderRadius: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center"
                    }}>
                        <span style={{ color: "#059669", fontWeight: "bold" }}>
                            ✅ {t("qrcodeId")}: {id}
                        </span>
                        <button
                            onClick={handleClearParams}
                            style={{ 
                                padding: "4px 10px",
                                borderRadius: "4px",
                                border: "1px solid #059669",
                                background: "transparent",
                                color: "#059669",
                                cursor: "pointer",
                                fontSize: "12px"
                            }}
                        >{t("clear")}</button>
                    </div>
                )}
                <QRCodeScanner />
            </main>
        </div>
    );
}