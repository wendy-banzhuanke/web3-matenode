export const SUPPORTED_CHAINS = {
  LOCALHOST: {
    id: '0x7A69',
    name: 'Localhost',
    rpcUrl: 'http://localhost:8545'
  },
  SEPOLIA: {
    id: '0xaa36a7',
    name: 'Sepolia',
    rpcUrl: 'https://rpc.sepolia.org'
  },
  MAINNET: {
    id: '0x1',
    name: 'Ethereum',
    rpcUrl: 'https://mainnet.infura.io/v3/YOUR_KEY'
  }
}

export type ChainId = keyof typeof SUPPORTED_CHAINS
