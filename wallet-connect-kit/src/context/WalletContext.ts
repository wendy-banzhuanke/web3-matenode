import { createContext } from 'react'

export interface WalletState {
    account?: string | null,
    chainId?: number | null,
    isConnected?: boolean,
}

export interface WalletContextType extends WalletState {
    connectWallet: () => Promise<void>
    disconnectWallet: () => void
}

export const WalletContext = createContext<WalletContextType>({
    account: null,
    chainId: null,
    isConnected: false,
    connectWallet: () => Promise.resolve(),
    disconnectWallet: () => {},
})

