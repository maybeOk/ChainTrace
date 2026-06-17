import { Button, Container, Flex, Heading, TextField, Card } from "@radix-ui/themes";
import { useCurrentAccount } from "@mysten/dapp-kit-react";
import { useState } from "react";
import { mockStore, type Enterprise } from "../store/mockStore";

interface EnterpriseRegisterProps {
    onRegistered: (enterprise: Enterprise) => void;
}

export function EnterpriseRegister({ onRegistered }: EnterpriseRegisterProps) {
    const currentAccount = useCurrentAccount();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = () => {
        if (!name.trim() || !description.trim()) {
            alert("请填写完整信息");
            return;
        }

        if (!currentAccount) {
            alert("请先连接钱包");
            return;
        }

        setIsSubmitting(true);

        setTimeout(() => {
            const newEnterprise = mockStore.registerEnterprise(name, description, currentAccount.address);
            alert("企业注册成功！");
            onRegistered(newEnterprise);
            setIsSubmitting(false);
        }, 500);
    };

    return (
        <Container>
            <Card style={{ padding: "24px", maxWidth: 500, margin: "0 auto" }}>
                <Heading size="3" mb="4" style={{ textAlign: "center" }}>企业注册</Heading>
                <Flex direction="column" gap="4">
                    <TextField.Root
                        placeholder="企业名称"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isSubmitting}
                    />
                    <textarea
                        placeholder="企业描述"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                        rows={4}
                        style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--gray-a3)" }}
                    />
                    <Button onClick={handleSubmit} disabled={isSubmitting} style={{ marginTop: "16px" }}>
                        {isSubmitting ? "注册中..." : "注册企业"}
                    </Button>
                </Flex>
            </Card>
        </Container>
    );
}