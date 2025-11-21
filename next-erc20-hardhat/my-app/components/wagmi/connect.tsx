import * as React from 'react';
import { Connector, useChainId, useConnect, useConnectors } from 'wagmi';

export function Connect() {
  const chainId = useChainId();

  const { connect } = useConnect()
  const connectors = useConnectors()

  return (
    <div className="buttons">
      {connectors.map((connector) => (
        <ConnectorButton
          key={connector.uid}
          connector={connector}
          onClick={() => connect({ connector, chainId })}
        />
      ))}
    </div>
  );
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
    <button
      className="button"
      disabled={!ready}
      onClick={onClick}
      type="button"
    >
      {connector.name}
    </button>
  );
}
