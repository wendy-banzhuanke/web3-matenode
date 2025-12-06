export interface EthereumProvider {
  request(args: { method: string; params?: unknown[] }): Promise<unknown>
  on(event: string, callback: (...args: unknown[]) => void): void
  removeListener(event: string, callback: (...args: unknown[]) => void): void
  disconnect(): Promise<void>,
  isMetaMask?: boolean,
  isCoinbaseWallet?: boolean,
  isOkxWallet?: boolean,
  isPhantom?: boolean,
  ethereum?: EthereumProvider
  _handleDisconnect?: () => Promise<void>
}