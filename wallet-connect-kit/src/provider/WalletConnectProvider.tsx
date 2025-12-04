'use client'
 
import { useState, useEffect } from 'react' 
// import type { React.ReactNode } from 'react'
import { WalletContext, type WalletState } from '../context/WalletContext'
import { SUPPORTED_WALLETS, type WalletType } from '../constants/wallets'
 
export default function WalletConnectKitProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const [walletState, setWalletState] = useState<WalletState>({
    provider: null,
    account: null,
    chainId: null,
    isConnected: false,
  })


//   // Coinbase Wallet独立检测
// if (window.coinbaseWalletExtension) {
//   const coinbaseProvider = window.coinbaseWalletExtension
// }

// // OKX Wallet独立检测
// if (window.okxwallet) {
//   const okxProvider = window.okxwallet
// }
  function getProvider(type: string) {
    switch (type) {
      case 'metamask':
        return window.ethereum?.isMetaMask ? window.ethereum : null // window.web3?.currentProvider : null
      case 'coinbase':
        return window.coinbaseWalletExtension?.isCoinbaseWallet ? window.coinbaseWalletExtension : null
      case 'okx':
        return window.okxwallet?.isOkxWallet ? window.okxwallet : null
      case 'phantom':
        return window.phantom?.ethereum?.isPhantom ? window.phantom?.ethereum : null
      default:
        return null
    }
  }

  const connectWallet = async (walletType: WalletType) => {
    const wallet = SUPPORTED_WALLETS[walletType.toUpperCase() as WalletType]

    if (!wallet.detector()) {
      throw new Error(`${wallet.name} not detected`)
    }

    const provider = getProvider(walletType)

    try {
      // const accounts = await window.ethereum!.request({ method: 'eth_requestAccounts' })
      const accounts = await provider!.request({ method: 'eth_requestAccounts', params: [{ forceReload: true }] }) // 关键参数
      const chainId = await provider!.request({ method: 'eth_chainId' })
      const balance = await provider!.request({ method: "eth_getBalance", params: [accounts[0], "latest"] }); // "latest" 表示最新区块

      // 根据 chainId 返回原生代币 Symbol
      function getNativeCurrencySymbol(chainId: string) {
        const chainIdNum = parseInt(chainId, 16);
        
        const symbolMap: Record<number, string> = {
          1: "ETH",     // Ethereum Mainnet
          56: "BNB",    // BSC
          137: "MATIC", // Polygon
          10: "ETH",    // Optimism
          1155111: "ETH", // Sepolia
          31337: "ETH", // Localhost
        };
        
        return symbolMap[chainIdNum] ?? "ETH"; // 默认返回 ETH
      }

      console.log("====", accounts, BigInt(balance), chainId, getNativeCurrencySymbol(chainId))
      setWalletState({
        provider,
        account: accounts[0],
        amount: BigInt(balance),
        symbol: getNativeCurrencySymbol(chainId),
        chainId,
        isConnected: true,
      })
    } catch (error) {
      // TODO 提示用户连接钱包失败
      console.log('连接钱包失败', error)
    }
  }

  const disconnectWallet = async () => {
    console.log("walletState.provider===", walletState.provider)
    if (!walletState.provider) return
    await walletState.provider!.request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }]});

    setWalletState({
      provider: null,
      account: null,
      chainId: null,
      isConnected: false,
    })
  }

  // 监听账户变化
  useEffect(() => {
    if(!window || !window?.ethereum){
      return
    }

    const handleAccountsChanged = (accounts: string[]) => {
      setWalletState(prev => ({
        ...prev,
        account: accounts[0] || null,
        isConnected: accounts.length > 0,
      }))
    }

    window.ethereum.on('accountsChanged', handleAccountsChanged)

    return () => {
      window.ethereum?.removeListener('accountsChanged', handleAccountsChanged)
    }
  }, [])

  // 监听链变化
  useEffect(() => {
    if(!window || !window?.ethereum){
      return
    }

    const handleChainChanged = (chainId: number ) => {
      setWalletState(prev => ({
        ...prev,
        chainId
      }))
    }

    window.ethereum.on('chainChanged', handleChainChanged)

    return () => {
      window.ethereum?.removeListener('chainChanged', handleChainChanged)
    }
  }, [])

  // 初始化时检查已有连接
  useEffect(() => {
    async function checkConnection() {
      if (!window.ethereum) return
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' })
        if(accounts.length > 0) {
          const chainId = await window.ethereum.request({ method: 'eth_chainId' })
          setWalletState({
            account: accounts[0],
            chainId,
            isConnected: true,
          })
        }
      } catch (error) {
        console.log('初始化检查连接失败', error)
      }
    }
    checkConnection()
  }, [])
  
  return (
    <WalletContext value={{
      ...walletState,
      connectWallet,
      disconnectWallet,
    }}>
      {children}
      {/* TODO <WalletConnectModal /> */}
    </WalletContext>
  )
}

