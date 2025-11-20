'use client';

import Link from 'next/link';
import { Connector, useConnect, useConnectors } from 'wagmi'
import WagmiHeader from "@/components/wagmi/header"

export default function Page() {
  const { connect } = useConnect()
  const connectors = useConnectors()
  const onConnectWallet = () => {
    console.log("12")
  }

  return (
    <div>
      {connectors.map((connector) => (
        <button key={connector.uid} onClick={() => connect({ connector })}>
          {connector.name}
        </button>
      ))}
      <WagmiHeader onConnectWallet={onConnectWallet} />
      <h1 className="mb-4">Wagmi Data</h1>
      <Link href="/wagmi/dashboard">进入Dashboard </Link>
    </div>
  );
}
