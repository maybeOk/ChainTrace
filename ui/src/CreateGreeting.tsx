import { Transaction } from "@mysten/sui/transactions";
import { Button, Container } from "@radix-ui/themes";
import { useDAppKit } from "@mysten/dapp-kit-react";
import { useMutation } from "@tanstack/react-query";
import { useNetworkVariable } from "./networkConfig";
import { useState } from "react";
import { ClipLoader } from "react-spinners";

export function CreateGreeting({
  onCreated,
}: {
  onCreated: (id: string) => void;
}) {
  const helloWorldPackageId = useNetworkVariable("helloWorldPackageId");
  const dAppKit = useDAppKit();

  const { mutate: signAndExecute } = useMutation({
    mutationFn: (tx: Transaction) =>
      dAppKit.signAndExecuteTransaction({ transaction: tx }),
  });

  const [waitingForTxn, setWaitingForTxn] = useState(false);

  const create = () => {
    setWaitingForTxn(true);

    const tx = new Transaction();

    tx.moveCall({
      arguments: [],
      target: `${helloWorldPackageId}::greeting::new`,
    });

    signAndExecute(tx, {
      onSuccess: (result) => {
        const txData = result.Transaction ?? result.FailedTransaction;
        if (txData?.effects) {
          const created = txData.effects.changedObjects.filter(
            (obj) => obj.idOperation === "Created",
          );
          const objectId = created[0]?.objectId;
          if (objectId) {
            onCreated(objectId);
          }
        }
        setWaitingForTxn(false);
      },
    });
  };

  return (
    <Container>
      <Button
        size="3"
        onClick={() => {
          create();
        }}
        disabled={waitingForTxn}
      >
        {waitingForTxn ? <ClipLoader size={20} /> : "Create Greeting"}
      </Button>
    </Container>
  );
}
