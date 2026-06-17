import { Transaction } from "@mysten/sui/transactions";
import { Button, Container, Flex, Heading, Table } from "@radix-ui/themes";
import { useDAppKit } from "@mysten/dapp-kit-react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { ClipLoader } from "react-spinners";
import { TESTNET_PRODUCT_TRACE_PACKAGE_ID, PRODUCT_TRACE_FUNCTIONS } from "../constants";

interface Product {
    id: string;
    name: string;
    description: string;
    enterprise: string;
    createdAt: number;
}

interface ProductListProps {
    onSelectProduct: (productId: string) => void;
}

export function ProductList({ onSelectProduct }: ProductListProps) {
    const dAppKit = useDAppKit();

    const { data: products, isLoading: isProductsLoading } = useQuery({
        queryKey: ["products"],
        queryFn: async () => {
            const productList: Product[] = [];
            return productList;
        },
    });

    const { mutate: signAndExecute, isPending } = useMutation({
        mutationFn: (tx: Transaction) =>
            dAppKit.signAndExecuteTransaction({ transaction: tx }),
    });

    const handleGenerateQRCode = (productId: string) => {
        const tx = new Transaction();

        tx.moveCall({
            target: `${TESTNET_PRODUCT_TRACE_PACKAGE_ID}::${PRODUCT_TRACE_FUNCTIONS.createQRCode}`,
            arguments: [
                tx.object(TESTNET_PRODUCT_TRACE_PACKAGE_ID),
                tx.object(productId),
            ],
        });

        signAndExecute(tx, {
            onSuccess: (result) => {
                const txData = result.Transaction ?? result.FailedTransaction;
                if (txData?.effects) {
                    const changed = txData.effects.changedObjects.filter(
                        (obj) => obj.idOperation === "Created",
                    );
                    if (changed && changed.length > 0) {
                        const objectId = changed[0].objectId;
                        alert(`二维码创建成功！QR Code ID: ${objectId}`);
                    }
                }
            },
            onError: () => {
                alert("创建二维码失败，请重试");
            },
        });
    };

    if (isProductsLoading) {
        return (
            <Container>
                <Flex justify="center" align="center" py="10">
                    <ClipLoader size={40} color="var(--accent-9)" />
                </Flex>
            </Container>
        );
    }

    return (
        <Container>
            <Heading size="3" mb="4">商品列表</Heading>
            <Table.Root>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeaderCell>商品名称</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>描述</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>创建时间</Table.ColumnHeaderCell>
                        <Table.ColumnHeaderCell>操作</Table.ColumnHeaderCell>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {products?.length === 0 ? (
                        <Table.Row>
                            <Table.Cell colSpan={4} style={{ textAlign: "center" }}>
                                暂无商品
                            </Table.Cell>
                        </Table.Row>
                    ) : (
                        products?.map((product: Product) => (
                            <Table.Row key={product.id}>
                                <Table.Cell>
                                    <Button variant="ghost" onClick={() => onSelectProduct(product.id)}>
                                        {product.name}
                                    </Button>
                                </Table.Cell>
                                <Table.Cell>{product.description}</Table.Cell>
                                <Table.Cell>
                                    {new Date(product.createdAt).toLocaleString()}
                                </Table.Cell>
                                <Table.Cell>
                                    <Button
                                        onClick={() => handleGenerateQRCode(product.id)}
                                        disabled={isPending}
                                    >
                                        {isPending ? (
                                            <ClipLoader size={14} color="white" />
                                        ) : (
                                            "生成二维码"
                                        )}
                                    </Button>
                                </Table.Cell>
                            </Table.Row>
                        ))
                    )}
                </Table.Body>
            </Table.Root>
        </Container>
    );
}