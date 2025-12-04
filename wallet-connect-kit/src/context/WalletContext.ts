import { createContext } from 'react'
import type { WalletType } from '../constants/wallets'
import type { EthereumProvider } from '../type/ethereum'



export interface WalletState {
    provider?: null | EthereumProvider,
    account?: string | null,
    amount?: string | bigint | number | null,
    symbol?: string | null,
    chainId?: number | null,
    isConnected?: boolean,
}

export interface WalletContextType extends WalletState {
    connectWallet: (walletType: WalletType) => Promise<void>
    disconnectWallet: () => void
}

export const WalletContext = createContext<WalletContextType>({
    provider: null,
    account: null,
    amount: null,
    symbol: null,
    chainId: null,
    isConnected: false,
    connectWallet: () => Promise.resolve(),
    disconnectWallet: () => {},
})

