import { useState } from "react";
import { useCurrentAccount, ConnectButton } from "@mysten/dapp-kit-react";
import { Link } from "react-router-dom";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import type { Enterprise } from "../store/mockStore";

interface WalletDropdownProps {
    enterprise: Enterprise | null;
}

export function WalletDropdown({ enterprise }: WalletDropdownProps) {
    const currentAccount = useCurrentAccount();
    const [isOpen, setIsOpen] = useState(false);
    const { theme } = useTheme();
    const { t } = useLanguage();

    const formatAddress = (address: string) => {
        if (!address) return "";
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    if (!currentAccount) {
        return (
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                <select
                    value={t("chinese") === "中文" ? "zh" : "en"}
                    onChange={(e) => {
                        const lang = e.target.value as "zh" | "en";
                        localStorage.setItem("language", lang);
                        window.location.reload();
                    }}
                    style={{
                        padding: "8px 12px",
                        borderRadius: "6px",
                        border: `1px solid ${theme.border}`,
                        background: theme.surface,
                        color: theme.text,
                        cursor: "pointer",
                        fontSize: "14px",
                        outline: "none",
                        appearance: "none"
                    }}
                >
                    <option value="zh">中文</option>
                    <option value="en">English</option>
                </select>
                <ConnectButton />
            </div>
        );
    }

    return (
        <div style={{ position: "relative", display: "flex", gap: "10px", alignItems: "center" }}>
            <select
                value={t("chinese") === "中文" ? "zh" : "en"}
                onChange={(e) => {
                    const lang = e.target.value as "zh" | "en";
                    localStorage.setItem("language", lang);
                    window.location.reload();
                }}
                style={{
                    padding: "8px 12px",
                    borderRadius: "6px",
                    border: `1px solid ${theme.border}`,
                    background: theme.surface,
                    color: theme.text,
                    cursor: "pointer",
                    fontSize: "14px",
                    outline: "none",
                    appearance: "none"
                }}
            >
                <option value="zh">中文</option>
                <option value="en">English</option>
            </select>

            <div style={{ position: "relative" }}>
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "8px 16px",
                        borderRadius: "6px",
                        border: `1px solid ${theme.border}`,
                        background: theme.surface,
                        color: theme.text,
                        cursor: "pointer",
                        fontSize: "14px",
                        outline: "none"
                    }}
                >
                    <div
                        style={{
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.success} 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            fontWeight: "bold",
                            fontSize: "12px"
                        }}
                    >
                        {currentAccount.address.slice(0, 2).toUpperCase()}
                    </div>
                    <span style={{ fontSize: "14px" }}>{formatAddress(currentAccount.address)}</span>
                    <span style={{ 
                        fontSize: "12px", 
                        color: theme.textSecondary,
                        transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                        transition: "transform 0.2s"
                    }}>▼</span>
                </button>

                {isOpen && (
                    <div
                        style={{
                            position: "absolute",
                            top: "100%",
                            right: 0,
                            marginTop: "8px",
                            minWidth: "280px",
                            background: theme.surface,
                            border: `1px solid ${theme.border}`,
                            borderRadius: "8px",
                            boxShadow: theme.shadow,
                            zIndex: 1000,
                            overflow: "hidden"
                        }}
                    >
                        <div style={{ padding: "16px", borderBottom: `1px solid ${theme.border}` }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "50%",
                                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.success} 100%)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        color: "white",
                                        fontWeight: "bold",
                                        fontSize: "18px"
                                    }}
                                >
                                    {currentAccount.address.slice(0, 2).toUpperCase()}
                                </div>
                                <div>
                                    <div style={{ fontSize: "14px", fontWeight: "bold", color: theme.text }}>
                                        {formatAddress(currentAccount.address)}
                                    </div>
                                    <div style={{ fontSize: "12px", color: theme.textSecondary, wordBreak: "break-all" }}>
                                        {currentAccount.address}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {enterprise && (
                            <Link
                                to="/enterprise-profile"
                                onClick={() => setIsOpen(false)}
                                style={{
                                    display: "block",
                                    padding: "16px",
                                    borderBottom: `1px solid ${theme.border}`,
                                    textDecoration: "none",
                                    cursor: "pointer"
                                }}
                            >
                                <div style={{ fontSize: "12px", color: theme.textSecondary, marginBottom: "8px" }}>
                                    {t("enterpriseInfo")}
                                </div>
                                <div style={{ fontSize: "14px", fontWeight: "bold", color: theme.primary }}>
                                    🏢 {enterprise.name} →
                                </div>
                                <div style={{ fontSize: "12px", color: theme.textSecondary }}>
                                    {t("productCount")}: {enterprise.productCount}
                                </div>
                                <div style={{ fontSize: "12px", color: theme.textSecondary }}>
                                    {t("createdAt")}: {new Date(enterprise.createdAt).toLocaleDateString()}
                                </div>
                            </Link>
                        )}

                        <div style={{ padding: "8px" }}>
                            <ConnectButton />
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}