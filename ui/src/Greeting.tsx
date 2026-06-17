import {
  useDAppKit,
  useCurrentClient,
} from "@mysten/dapp-kit-react";
import { Transaction } from "@mysten/sui/transactions";
import { Button, Flex, Heading, Link, Text, TextField } from "@radix-ui/themes";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNetworkVariable } from "./networkConfig";
import { useState } from "react";
import ClipLoader from "react-spinners/ClipLoader";

export function Greeting({ id }: { id: string }) {
  const helloWorldPackageId = useNetworkVariable("helloWorldPackageId");
  const client = useCurrentClient();
  const dAppKit = useDAppKit();
  const queryClient = useQueryClient();

  const { mutate: signAndExecute } = useMutation({
    mutationFn: (tx: Transaction) =>
      dAppKit.signAndExecuteTransaction({ transaction: tx }),
  });

  const { data, isPending, error } = useQuery({
    queryKey: ["getObject", id],
    queryFn: () =>
      client.core.getObject({ objectId: id, include: { json: true } }),
  });

  const [newText, setNewText] = useState("");
  const [waitingForTxn, setWaitingForTxn] = useState(false);

  const executeMoveCall = () => {
    setWaitingForTxn(true);

    const tx = new Transaction();

    tx.moveCall({
      target: `${helloWorldPackageId}::greeting::update_text`,
      arguments: [tx.object(id), tx.pure.string(newText)],
    });

    signAndExecute(tx, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ["getObject", id] });
        setWaitingForTxn(false);
        setNewText("");
      },
    });
  };

  if (isPending) return <Text>Loading...</Text>;

  if (error) return <Text>Error: {error.message}</Text>;

  if (!data) return <Text>Not found</Text>;

  const fields = data.object.json as { text: string } | null;

  return (
    <>
      <Heading size="3">
        Greeting{" "}
        <Link
          href={`https://testnet.suivision.xyz/object/${id}`}
          target="_blank"
        >
          {id}
        </Link>
      </Heading>

      <Flex direction="column" gap="2">
        <Text>Text: {fields?.text}</Text>
        <Flex direction="row" gap="2">
          <TextField.Root
            placeholder={fields?.text}
            value={newText}
            onChange={(e) => {
              setNewText(e.target.value);
            }}
            disabled={waitingForTxn}
          />
          <Button onClick={() => executeMoveCall()} disabled={waitingForTxn}>
            {waitingForTxn ? <ClipLoader size={20} /> : "Update"}
          </Button>
        </Flex>
      </Flex>
    </>
  );
}
