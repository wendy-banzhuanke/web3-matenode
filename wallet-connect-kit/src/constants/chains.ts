export const SUPPORTED_CHAINS = {
  LOCALHOST: {
    id: 31337,
    name: 'Localhost',
    rpcUrl: 'http://localhost:8545',
    isTestnet: true
  },
  SEPOLIA: {
    id: 11155111,
    name: 'Sepolia',
    rpcUrl: 'https://rpc.sepolia.org',
    isTestnet: true
  },
  MAINNET: {
    id: 1,
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY',
    isTestnet: false
  }
}

export type ChainId = keyof typeof SUPPORTED_CHAINS