import type { EthereumProvider } from './type/index'
export declare global {
  interface Window {
    ethereum?: EthereumProvider
    coinbaseWalletExtension?: EthereumProvider
    okxwallet?: EthereumProvider
    phantom?: EthereumProvider
  }
}
