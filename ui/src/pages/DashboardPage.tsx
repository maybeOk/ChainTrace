import { useEffect, useState } from "react";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { ClipLoader } from "react-spinners";
import { Dashboard } from "../components/Dashboard";
import { WalletDropdown } from "../components/WalletDropdown";
import { mockStore, type Enterprise } from "../store/mockStore";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import { useBlockchainService } from "../services/blockchain";

export function DashboardPage() {
    const currentAccount = useCurrentAccount();
    const [loading, setLoading] = useState(true);
    const [enterprise, setEnterprise] = useState<Enterprise | null>(null);
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { registerEnterprise, getEnterpriseFromChain } = useBlockchainService();

    useEffect(() => {
        if (!currentAccount) {
            setLoading(false);
            return;
        }

        const checkOrCreateEnterprise = async () => {
            let found: Enterprise | null = mockStore.getEnterpriseByOwner(currentAccount.address) || null;
            
            if (!found) {
                const chainEnterprise = await getEnterpriseFromChain(currentAccount.address);
                if (chainEnterprise) {
                    found = {
                        id: chainEnterprise.id,
                        name: chainEnterprise.name,
                        description: chainEnterprise.description,
                        owner: chainEnterprise.owner,
                        createdAt: chainEnterprise.createdAt || Date.now(),
                        productCount: chainEnterprise.productCount || 0,
                    };
                    mockStore.registerEnterprise(
                        found.name,
                        found.description,
                        found.owner
                    );
                } else {
                    const result = await registerEnterprise({
                        name: "My Enterprise",
                        description: "Enterprise description",
                    });
                    if (result.mock && result.data) {
                        found = result.data;
                    } else if (!result.mock && result.data) {
                        found = {
                            id: result.data.id,
                            name: result.data.name,
                            description: result.data.description,
                            owner: result.data.owner,
                            createdAt: result.data.createdAt || Date.now(),
                            productCount: result.data.productCount || 0,
                        };
                        mockStore.registerEnterprise(
                            found.name,
                            found.description,
                            found.owner
                        );
                    } else {
                        found = {
                            id: "chain-enterprise-id",
                            name: "My Enterprise",
                            description: "Enterprise description",
                            owner: currentAccount.address,
                            createdAt: Date.now(),
                            productCount: 0,
                        };
                        mockStore.registerEnterprise(
                            found.name,
                            found.description,
                            found.owner
                        );
                    }
                }
            }
            setEnterprise(found);
            setLoading(false);
        };

        checkOrCreateEnterprise();
    }, [currentAccount, registerEnterprise, getEnterpriseFromChain]);

    if (!currentAccount) {
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
                    <WalletDropdown enterprise={enterprise} />
                </header>
                <main style={{ padding: "40px 20px", minHeight: "500px" }}>
                    <div style={{ textAlign: "center" }}>
                        <h2 style={{ fontSize: "24px", color: theme.textSecondary }}>{t("pleaseConnectWallet")}</h2>
                    </div>
                </main>
            </div>
        );
    }

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
                    <WalletDropdown enterprise={enterprise} />
                </header>
                <main style={{ padding: "40px 20px", minHeight: "500px" }}>
                    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "400px" }}>
                        <ClipLoader size={40} color={theme.primary} />
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
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <Link
                        to="/verify"
                        style={{ 
                            padding: "8px 16px",
                            borderRadius: "6px",
                            backgroundColor: theme.success,
                            color: "white",
                            textDecoration: "none",
                            fontSize: "14px",
                            fontWeight: "bold"
                        }}
                    >
                        {t("scanner")}
                    </Link>
                    <WalletDropdown enterprise={enterprise} />
                </div>
            </header>

            <main style={{ padding: "20px" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    {enterprise && <Dashboard enterprise={enterprise} ownerAddress={currentAccount.address} />}
                </div>
            </main>
        </div>
    );
}