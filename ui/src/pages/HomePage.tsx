import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { Link } from "react-router-dom";
import { WalletDropdown } from "../components/WalletDropdown";

export function HomePage() {
    const { theme } = useTheme();
    const { t } = useLanguage();

    const features = [
        {
            icon: "🌍",
            title: t("globalCoverage"),
            description: t("globalCoverageDesc"),
        },
        {
            icon: "🔓",
            title: t("openTransparent"),
            description: t("openTransparentDesc"),
        },
        {
            icon: "🆓",
            title: t("freeToUse"),
            description: t("freeToUseDesc"),
        },
        {
            icon: "💎",
            title: t("chainPermanent"),
            description: t("chainPermanentDesc"),
        },
        {
            icon: "🎫",
            title: t("nftVerification"),
            description: t("nftVerificationDesc"),
        },
        {
            icon: "⚡",
            title: t("fastEfficient"),
            description: t("fastEfficientDesc"),
        },
    ];

    const stats = [
        { value: "10M+", label: t("qrcodesGenerated") },
        { value: "100K+", label: t("enterprises") },
        { value: "99.9%", label: t("uptime") },
        { value: "0", label: t("cost") },
    ];

    const workflow = [
        {
            step: "01",
            title: t("createProduct"),
            description: t("createProductDesc"),
        },
        {
            step: "02",
            title: t("uploadChain"),
            description: t("uploadChainDesc"),
        },
        {
            step: "03",
            title: t("generateQrcode"),
            description: t("generateQrcodeDesc"),
        },
        {
            step: "04",
            title: t("scanVerify"),
            description: t("scanVerifyDesc"),
        },
    ];

    return (
        <div style={{ minHeight: "100vh", background: theme.background }}>
            <header style={{ 
                position: "sticky",
                top: 0,
                padding: "16px 24px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                background: `${theme.surface}80`,
                backdropFilter: "blur(10px)",
                borderBottom: `1px solid ${theme.border}`,
                zIndex: 1000
            }}>
                <Link to="/" style={{ textDecoration: "none" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ 
                            width: "40px", 
                            height: "40px", 
                            borderRadius: "10px", 
                            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.success} 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "20px"
                        }}>🔗</div>
                        <span style={{ fontSize: "20px", fontWeight: "bold", color: theme.text }}>{t("title")}</span>
                    </div>
                </Link>
                <div style={{ display: "flex", gap: "24px", alignItems: "center" }}>
                    <Link to="/" style={{ textDecoration: "none", color: theme.text, fontSize: "14px", fontWeight: "bold" }}>{t("home")}</Link>
                    <Link to="/dashboard" style={{ textDecoration: "none", color: theme.textSecondary, fontSize: "14px" }}>{t("dashboard")}</Link>
                    <Link to="/verify" style={{ textDecoration: "none", color: theme.textSecondary, fontSize: "14px" }}>🔍 {t("scanVerify")}</Link>
                    <WalletDropdown enterprise={null} />
                </div>
            </header>

            <section style={{ 
                padding: "80px 24px", 
                background: `linear-gradient(180deg, ${theme.surface} 0%, ${theme.background} 100%)`,
                position: "relative",
                overflow: "hidden"
            }}>
                <div style={{ 
                    position: "absolute", 
                    top: 0, 
                    left: 0, 
                    right: 0, 
                    bottom: 0,
                    background: `radial-gradient(circle at 30% 20%, ${theme.primary}15 0%, transparent 50%),
                                radial-gradient(circle at 70% 80%, ${theme.success}15 0%, transparent 50%),
                                radial-gradient(circle at 50% 50%, ${theme.primary}10 0%, transparent 60%)`
                }} />
                
                <div style={{ maxWidth: 1200, margin: "0 auto", position: "relative", zIndex: 1 }}>
                    <div style={{ textAlign: "center", marginBottom: "60px" }}>
                        <div style={{ 
                            display: "inline-block",
                            padding: "12px 24px",
                            borderRadius: "30px",
                            background: `${theme.primary}20`,
                            border: `1px solid ${theme.primary}40`,
                            marginBottom: "24px"
                        }}>
                            <span style={{ color: theme.primary, fontSize: "14px", fontWeight: "bold" }}>🌐 {t("globalPlatform")}</span>
                        </div>
                        <h1 style={{ 
                            fontSize: "56px", 
                            fontWeight: "bold", 
                            color: theme.text, 
                            marginBottom: "24px",
                            background: `linear-gradient(135deg, ${theme.text} 0%, ${theme.textSecondary} 100%)`,
                            WebkitBackgroundClip: "text",
                            WebkitTextFillColor: "transparent"
                        }}>
                            {t("heroTitle")}
                        </h1>
                        <p style={{ 
                            fontSize: "20px", 
                            color: theme.textSecondary, 
                            marginBottom: "40px",
                            maxWidth: 600,
                            marginLeft: "auto",
                            marginRight: "auto"
                        }}>
                            {t("heroSubtitle")}
                        </p>
                        <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                            <Link 
                                to="/dashboard"
                                style={{ 
                                    padding: "14px 32px",
                                    borderRadius: "10px",
                                    background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.success} 100%)`,
                                    color: "white",
                                    textDecoration: "none",
                                    fontSize: "16px",
                                    fontWeight: "bold",
                                    boxShadow: `0 4px 20px ${theme.primary}40`
                                }}
                            >
                                {t("getStarted")}
                            </Link>
                            <Link 
                                to="/verify"
                                style={{ 
                                    padding: "14px 32px",
                                    borderRadius: "10px",
                                    border: `2px solid ${theme.border}`,
                                    background: "transparent",
                                    color: theme.text,
                                    textDecoration: "none",
                                    fontSize: "16px",
                                    fontWeight: "bold"
                                }}
                            >
                                {t("scanNow")}
                            </Link>
                        </div>
                    </div>

                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(4, 1fr)", 
                        gap: "20px",
                        marginBottom: "80px"
                    }}>
                        {stats.map((stat, index) => (
                            <div 
                                key={index}
                                style={{ 
                                    padding: "32px",
                                    background: theme.surface,
                                    borderRadius: "16px",
                                    border: `1px solid ${theme.border}`,
                                    textAlign: "center"
                                }}
                            >
                                <div style={{ fontSize: "48px", fontWeight: "bold", color: theme.primary, marginBottom: "8px" }}>
                                    {stat.value}
                                </div>
                                <div style={{ fontSize: "14px", color: theme.textSecondary }}>
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    <div style={{ 
                        display: "grid", 
                        gridTemplateColumns: "repeat(3, 1fr)", 
                        gap: "24px"
                    }}>
                        {features.map((feature, index) => (
                            <div 
                                key={index}
                                style={{ 
                                    padding: "32px",
                                    background: theme.surface,
                                    borderRadius: "16px",
                                    border: `1px solid ${theme.border}`
                                }}
                            >
                                <div style={{ fontSize: "40px", marginBottom: "16px" }}>{feature.icon}</div>
                                <h3 style={{ fontSize: "18px", fontWeight: "bold", color: theme.text, marginBottom: "12px" }}>
                                    {feature.title}
                                </h3>
                                <p style={{ fontSize: "14px", color: theme.textSecondary, lineHeight: "1.6" }}>
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: "80px 24px", background: theme.surface }}>
                <div style={{ maxWidth: 1200, margin: "0 auto" }}>
                    <div style={{ textAlign: "center", marginBottom: "60px" }}>
                        <h2 style={{ fontSize: "36px", fontWeight: "bold", color: theme.text, marginBottom: "16px" }}>
                            {t("howItWorks")}
                        </h2>
                        <p style={{ fontSize: "16px", color: theme.textSecondary }}>
                            {t("howItWorksDesc")}
                        </p>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "24px" }}>
                        {workflow.map((step, index) => (
                            <div key={index} style={{ position: "relative" }}>
                                <div style={{ 
                                    padding: "32px",
                                    background: theme.background,
                                    borderRadius: "16px",
                                    border: `1px solid ${theme.border}`
                                }}>
                                    <div style={{ 
                                        width: "48px", 
                                        height: "48px", 
                                        borderRadius: "12px",
                                        background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.success} 100%)`,
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginBottom: "20px",
                                        fontSize: "20px",
                                        fontWeight: "bold",
                                        color: "white"
                                    }}>
                                        {step.step}
                                    </div>
                                    <h3 style={{ fontSize: "18px", fontWeight: "bold", color: theme.text, marginBottom: "12px" }}>
                                        {step.title}
                                    </h3>
                                    <p style={{ fontSize: "14px", color: theme.textSecondary, lineHeight: "1.6" }}>
                                        {step.description}
                                    </p>
                                </div>
                                {index < workflow.length - 1 && (
                                    <div style={{ 
                                        position: "absolute",
                                        top: "50%",
                                        left: "100%",
                                        transform: "translateY(-50%)",
                                        marginLeft: "12px",
                                        width: "24px",
                                        height: "2px",
                                        background: theme.border
                                    }}>
                                        <div style={{ 
                                            position: "absolute",
                                            right: "-6px",
                                            top: "-5px",
                                            width: "12px",
                                            height: "12px",
                                            borderRadius: "50%",
                                            background: theme.primary
                                        }} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section style={{ padding: "80px 24px", background: theme.background }}>
                <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
                    <h2 style={{ fontSize: "36px", fontWeight: "bold", color: theme.text, marginBottom: "16px" }}>
                        {t("readyToStart")}
                    </h2>
                    <p style={{ fontSize: "16px", color: theme.textSecondary, marginBottom: "40px" }}>
                        {t("readyToStartDesc")}
                    </p>
                    <div style={{ display: "flex", gap: "16px", justifyContent: "center" }}>
                        <Link 
                            to="/dashboard"
                            style={{ 
                                padding: "14px 32px",
                                borderRadius: "10px",
                                background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.success} 100%)`,
                                color: "white",
                                textDecoration: "none",
                                fontSize: "16px",
                                fontWeight: "bold",
                                boxShadow: `0 4px 20px ${theme.primary}40`
                            }}
                        >
                            {t("startNow")}
                        </Link>
                    </div>
                </div>
            </section>

            <footer style={{ padding: "40px 24px", background: theme.surface, borderTop: `1px solid ${theme.border}` }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div style={{ 
                            width: "32px", 
                            height: "32px", 
                            borderRadius: "8px", 
                            background: `linear-gradient(135deg, ${theme.primary} 0%, ${theme.success} 100%)`,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "16px"
                        }}>🔗</div>
                        <span style={{ fontSize: "16px", fontWeight: "bold", color: theme.text }}>{t("title")}</span>
                    </div>
                    <div style={{ fontSize: "14px", color: theme.textSecondary }}>
                        {t("copyright")}
                    </div>
                </div>
            </footer>
        </div>
    );
}