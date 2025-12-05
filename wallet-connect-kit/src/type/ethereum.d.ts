export interface EthereumProvider {
  request(args: { method: string; params?: any[] }): Promise<any>
  on(event: string, callback: (...args: any[]) => void): void
  removeListener(event: string, callback: (...args: any[]) => void): void
  disconnect(): Promise<void>,
  isMetaMask?: boolean,
  isCoinbaseWallet?: boolean,
  isOkxWallet?: boolean,
  isPhantom?: boolean,
  ethereum?: EthereumProvider
  _handleDisconnect?: () => Promise<void>
}
export declare global {
  interface Window {
    ethereum?: EthereumProvider
    coinbaseWalletExtension?: EthereumProvider
    okxwallet?: EthereumProvider
    phantom?: EthereumProvider
  }
}
