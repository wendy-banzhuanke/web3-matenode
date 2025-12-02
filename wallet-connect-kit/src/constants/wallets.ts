export const SUPPORTED_WALLETS = {
  METAMASK: {
    id: 'metamask',
    name: 'MetaMask',
    icon: '/wallets/metamask.svg',
    detector: () => !!window.ethereum?.isMetaMask,
    installLink: 'https://metamask.io/download/'
  },
  COINBASE: {
    id: 'coinbase',
    name: 'Coinbase Wallet',
    icon: '/wallets/coinbase.svg',
    detector: () => 
      !!window.ethereum?.isCoinbaseWallet || 
      !!window.coinbaseWalletExtension,
    installLink: 'https://www.coinbase.com/wallet'
  },
  OKX: {
    id: 'okx',
    name: 'OKX Wallet',
    icon: '/wallets/okx.svg',
    detector: () => 
      !!window.ethereum?.isOkxWallet ||
      !!window.okxwallet,
    installLink: 'https://www.okx.com/web3'
  }
} as const
