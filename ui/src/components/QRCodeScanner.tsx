import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { type Product } from "../store/mockStore";
import { useTheme } from "../context/ThemeContext";
import { useLanguage } from "../context/LanguageContext";
import { useBlockchainService } from "../services/blockchain";

interface QRCodeInfo {
    qrcodeId: string;
    productId: string;
    firstScanner: string;
    firstScanTime: number;
    isClaimed: boolean;
    scanCount: number;
}

export function QRCodeScanner() {
    const currentAccount = useCurrentAccount();
    const [qrcodeId, setQrcodeId] = useState("");
    const [scanResult, setScanResult] = useState<QRCodeInfo | null>(null);
    const [product, setProduct] = useState<Product | null>(null);
    const [isScanning, setIsScanning] = useState(false);
    const [isClaiming, setIsClaiming] = useState(false);
    const [autoScanned, setAutoScanned] = useState(false);
    const { theme } = useTheme();
    const { t } = useLanguage();
    const { id } = useParams<{ id?: string }>();
    const { scanQRCode, claimNFT, getProductInfo } = useBlockchainService();

    useEffect(() => {
        const urlQrcodeId = id;
        if (urlQrcodeId && !autoScanned) {
            setQrcodeId(urlQrcodeId);
            setAutoScanned(true);
        }
    }, [id, autoScanned]);

    useEffect(() => {
        if (autoScanned && qrcodeId && !scanResult && !isScanning) {
            handleScan();
        }
    }, [autoScanned, qrcodeId, scanResult, isScanning]);

    const handleScan = async () => {
        if (!qrcodeId.trim()) {
            alert(t("pleaseEnterQrcode"));
            return;
        }

        if (!currentAccount) {
            alert(t("pleaseConnectWallet"));
            return;
        }

        setIsScanning(true);

        try {
            const scanResultData = await scanQRCode({ 
                qrcodeId, 
                qrcodeVersion: "1",
                scanner: currentAccount.address 
            });

            const qrcode = scanResultData.mock ? scanResultData.data : null;

            if (!qrcode) {
                alert(t("qrcodeNotFound"));
                setIsScanning(false);
                return;
            }

            const productInfo = await getProductInfo(qrcode.productId);

            setScanResult({
                qrcodeId: qrcode.id,
                productId: qrcode.productId,
                firstScanner: qrcode.firstScanner,
                firstScanTime: qrcode.firstScanTime,
                isClaimed: qrcode.isClaimed,
                scanCount: qrcode.scanCount,
            });

            if (productInfo) {
                setProduct(productInfo);
            }
        } catch (error) {
            console.error("Scan failed:", error);
            alert(t("scanFailed"));
        }

        setIsScanning(false);
    };

    const handleClaimNFT = async () => {
        if (!scanResult || !currentAccount) return;

        setIsClaiming(true);

        try {
            const claimResult = await claimNFT({
                qrcodeId: scanResult.qrcodeId,
                qrcodeVersion: "1",
                productId: scanResult.productId,
                productVersion: "1",
                claimer: currentAccount.address,
            });

            const nft = claimResult.mock ? claimResult.data : null;

            if (!nft) {
                alert(t("claimFailed"));
                setIsClaiming(false);
                return;
            }

            alert(`${t("nftClaimed")}\n\n${t("nftId")}: ${nft.id}\n${t("nftProductId")}: ${nft.productId}\n${t("nftClaimTime")}: ${new Date(nft.mintedAt).toLocaleString()}`);
            setScanResult({ ...scanResult, isClaimed: true });
        } catch (error) {
            console.error("Claim failed:", error);
            alert(t("claimFailed"));
        }

        setIsClaiming(false);
    };

    const canClaimNFT = scanResult && !scanResult.isClaimed &&
        currentAccount && scanResult.firstScanner === currentAccount.address;

    return (
        <div style={{ padding: "20px" }}>
            <div style={{ padding: "32px", marginBottom: "24px", background: `linear-gradient(135deg, ${theme.success} 0%, #059669 100%)`, borderRadius: "12px" }}>
                <h2 style={{ color: "white", marginBottom: "8px", fontSize: "24px" }}>
                    {t("productVerification")}
                </h2>
                <p style={{ color: "rgba(255,255,255,0.9)", margin: 0 }}>
                    {t("verificationDesc")}
                </p>
            </div>

            <div style={{ padding: "24px", maxWidth: 600, margin: "0 auto", background: theme.surface, borderRadius: "12px", boxShadow: theme.shadow }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                    <input
                        type="text"
                        placeholder={t("enterQRCode")}
                        value={qrcodeId}
                        onChange={(e) => setQrcodeId(e.target.value)}
                        disabled={isScanning || isClaiming}
                        style={{ fontSize: "16px", padding: "12px 14px", borderRadius: "8px", border: `2px solid ${theme.border}`, background: theme.surface, color: theme.text, outline: "none", transition: "border-color 0.2s" }}
                        onFocus={(e) => {
                            (e.target as HTMLInputElement).style.borderColor = theme.primary;
                            (e.target as HTMLInputElement).style.boxShadow = `0 0 0 3px ${theme.primary}20`;
                        }}
                        onBlur={(e) => {
                            (e.target as HTMLInputElement).style.borderColor = theme.border;
                            (e.target as HTMLInputElement).style.boxShadow = "none";
                        }}
                    />
                    <button 
                        onClick={handleScan} 
                        disabled={isScanning || isClaiming}
                        style={{ 
                            padding: "12px 20px", 
                            borderRadius: "8px", 
                            border: "none", 
                            cursor: "pointer", 
                            fontSize: "16px", 
                            background: theme.success, 
                            color: "white",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: "8px",
                            opacity: isScanning || isClaiming ? 0.7 : 1
                        }}
                    >
                        {isScanning || isClaiming ? (
                            <>
                                <span style={{ width: "18px", height: "18px", border: "2px solid white", borderTopColor: "transparent", borderRadius: "50%", animation: "spin 1s linear infinite" }}></span>
                                {t("processingText")}
                            </>
                        ) : (
                            t("scanVerify")
                        )}
                    </button>
                </div>
            </div>

            {scanResult && product && (
                <div style={{ padding: "24px", maxWidth: 600, margin: "24px auto 0", background: theme.surface, borderRadius: "12px", boxShadow: theme.shadow }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                        <h3 style={{ fontSize: "20px", margin: 0, color: theme.text }}>{t("verificationResult")}</h3>
                        <span style={{ padding: "4px 10px", borderRadius: "4px", background: "#d1fae5", color: "#059669", fontSize: "12px", fontWeight: "bold" }}>{t("productAuthentic")}</span>
                    </div>

                    <div style={{ padding: "16px", marginBottom: "16px", background: theme.background, borderRadius: "8px" }}>
                        <h4 style={{ fontSize: "16px", margin: "0 0 12px 0", color: theme.text }}>{t("productInfo")}</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ width: "24px", height: "24px", borderRadius: "6px", background: `${theme.primary}20`, display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <span style={{ fontWeight: "bold", color: theme.primary, fontSize: "12px" }}>{product.name.charAt(0)}</span>
                                </div>
                                <span style={{ fontWeight: "medium", fontSize: "16px", color: theme.text }}>{product.name}</span>
                            </div>
                            <p style={{ margin: 0, color: theme.text }}><strong>{t("category")}：</strong>{product.category}</p>
                            <p style={{ margin: 0, color: theme.text }}><strong>{t("productDescription")}：</strong>{product.description}</p>
                            {product.fields.length > 0 && (
                                <div>
                                    <p style={{ margin: 0, color: theme.text }}><strong>{t("extendedFields")}：</strong></p>
                                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", marginTop: "4px" }}>
                                        {product.fields.map((field) => (
                                            <p key={field.id} style={{ margin: 0, color: theme.textSecondary, fontSize: "14px" }}>
                                                • {field.name}: {field.value}
                                            </p>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {product.status === 'on_chain' && product.chainId && (
                                <p style={{ margin: 0, color: theme.textSecondary, fontSize: "14px" }}>
                                    <strong>{t("chainId")}：</strong>{product.chainId.slice(0, 8)}...
                                </p>
                            )}
                        </div>
                    </div>

                    <div style={{ padding: "16px", marginBottom: "16px", background: theme.background, borderRadius: "8px" }}>
                        <h4 style={{ fontSize: "16px", margin: "0 0 12px 0", color: theme.text }}>{t("scanHistory")}</h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <p style={{ margin: 0, color: theme.text }}><strong>{t("qrcodeCount")}：</strong>{scanResult.scanCount}</p>
                                {scanResult.scanCount > 1 && (
                                    <span style={{ padding: "2px 8px", borderRadius: "4px", border: "1px solid #f59e0b", background: "#fef3c7", color: "#d97706", fontSize: "12px" }}>{t("scannedTimes")}{scanResult.scanCount - 1}{t("times")}</span>
                                )}
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <p style={{ margin: 0, color: theme.text }}><strong>{t("nftClaim")}：</strong></p>
                                {scanResult.isClaimed ? (
                                    <span style={{ padding: "2px 8px", borderRadius: "4px", background: "#fee2e2", color: "#b91c1c", fontSize: "12px", fontWeight: "bold" }}>{t("alreadyClaimed")}</span>
                                ) : (
                                    <span style={{ padding: "2px 8px", borderRadius: "4px", background: "#d1fae5", color: "#059669", fontSize: "12px", fontWeight: "bold" }}>{t("canClaim")}</span>
                                )}
                            </div>
                            {scanResult.firstScanTime !== 0 && (
                                <>
                                    <p style={{ margin: 0, color: theme.text }}><strong>{t("firstScanTime")}：</strong>{new Date(scanResult.firstScanTime).toLocaleString()}</p>
                                    <p style={{ margin: 0, color: theme.text }}><strong>{t("firstScanner")}：</strong>{scanResult.firstScanner.slice(0, 8)}...</p>
                                </>
                            )}
                        </div>
                    </div>

                    {canClaimNFT && (
                        <div style={{ padding: "16px", background: "linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)", border: "1px solid #f59e0b", borderRadius: "8px" }}>
                            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                                <p style={{ fontWeight: "bold", color: "#92400e", margin: 0 }}>{t("congratsFirstScan")}</p>
                                <button 
                                    onClick={handleClaimNFT} 
                                    disabled={isClaiming}
                                    style={{ padding: "10px 16px", borderRadius: "6px", border: "none", cursor: "pointer", fontSize: "14px", background: "#f59e0b", color: "white", fontWeight: "bold", opacity: isClaiming ? 0.7 : 1 }}
                                >
                                    {isClaiming ? t("claiming") : t("claimNFT")}
                                </button>
                            </div>
                        </div>
                    )}

                    {!canClaimNFT && !scanResult.isClaimed && currentAccount && (
                        <div style={{ padding: "16px", background: "#fff7ed", border: "1px solid #fdba74", borderRadius: "8px" }}>
                            <p style={{ color: "#c2410c", margin: 0 }}>
                                {t("notFirstScan")}
                            </p>
                        </div>
                    )}

                    {scanResult.isClaimed && (
                        <div style={{ padding: "16px", background: theme.background, borderRadius: "8px" }}>
                            <p style={{ color: theme.textSecondary, margin: 0 }}>
                                {t("nftAlreadyClaimed")}
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}