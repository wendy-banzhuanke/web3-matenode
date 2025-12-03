import cbw from '../assets/wallets/cbw.png'
// import okx from '../assets/wallets/cbw.png'
import mm from '../assets/wallets/mm.png'
import none from '../assets/react.svg'

export type WalletType = keyof typeof SUPPORTED_WALLETS

export const SUPPORTED_WALLETS = {
  METAMASK: {
    id: 'metamask',
    name: 'MetaMask',
    icon: mm,
    detector: () => !!window.ethereum?.isMetaMask,
    installLink: 'https://metamask.io/download/'
  },
  COINBASE: {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: cbw,
    detector: () => !!window.coinbaseWalletExtension?.isCoinbaseWallet || !!window.ethereum?.isCoinbaseWallet,
    installLink: 'https://www.coinbase.com/wallet'
  },
  OKX: {
    id: 'okx',
    name: 'OKX Wallet',
    icon: none,
    detector: () => !!window.okxwallet?.isOkxWallet || !!window.ethereum?.isOkxWallet,
    installLink: 'https://www.okx.com/web3'
  },
  PHANTOM: {
    id: 'phantom',
    name: 'Phantom Wallet',
    icon: none,
    detector: () => !!window.phantom?.isPhantom || !!window.ethereum?.isPhantom,
    installLink: 'https://phantom.app/'
  },
} as const
