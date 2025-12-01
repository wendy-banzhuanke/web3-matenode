'use client'
 
import { createContext } from 'react'
// import type { Chain, Connector, Transport } from '../type'
 
const WalletConnectKitContext = createContext({})
 
export default function WalletConnectKitProvider({
  children,
  // chains: Chain[],
  // connectors: Connector[],
  // transports: Transport[],
}: {
  children: React.ReactNode
}) {
  return (
    <WalletConnectKitContext.Provider value="dark">
      {children}
      {/* TODO <WalletConnectModal /> */}
    </WalletConnectKitContext.Provider>
  )
}