import { useContext } from 'react'
import { WalletContext } from '../context/WalletContext'

export function useWallet() {
  const context = useContext(WalletContext)

  if(!context) {
    throw new Error('useWallet必须在WalletConnectProvider内使用')
  }

  return {
    account: context.account,
    chainId: context.chainId,
    isConnected: context.isConnected,
    connectWallet: context.connectWallet,
    disconnectWallet: context.disconnectWallet,
  }
}