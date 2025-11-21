import * as React from 'react';
import { Connector, useChainId, useConnect, useConnectors } from 'wagmi';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "../ui/button"

export function ConnectWallet() {
  const chainId = useChainId();
  
  const { connect } = useConnect()
  const connectors = useConnectors()
  

  return (<Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">Connect Wallet</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Choose a wallet to connect</DialogTitle>
          <DialogDescription>
            Please select a wallet to connect to the dApp.chainId:{chainId}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4">
          {connectors.map((connector) => (
            <ConnectorButton
              key={connector.uid}
              connector={connector}
              onClick={() => connect({ connector, chainId })}
            />
          ))}
        </div>
      </DialogContent>
    </Dialog>)
}

function ConnectorButton({
  connector,
  onClick,
}: {
  connector: Connector;
  onClick: () => void;
}) {
  const [ready, setReady] = React.useState(false);
  React.useEffect(() => {
    (async () => {
      const provider = await connector.getProvider();
      setReady(!!provider);
    })();
  }, [connector, setReady]);

  return (
    <div className="grid gap-3">
      <Button
        className="button"
        disabled={!ready}
        onClick={onClick}
        type="button"
      >
        {connector.name}
      </Button>
    </div>
  );
}