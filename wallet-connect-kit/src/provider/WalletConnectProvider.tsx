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


  const connectWallet = async (walletType: WalletType) => {
    const wallet = SUPPORTED_WALLETS[walletType.toUpperCase() as WalletType]
    console.log("wallet===", wallet, walletType, walletType.toUpperCase())

    function getProvider(type: string) {
      switch (type) {
        case 'metamask':
          return window.ethereum?.isMetaMask ? window.ethereum : null // window.web3?.currentProvider : null
        case 'coinbase':
          return window.coinbaseWalletExtension?.isCoinbaseWallet ? window.coinbaseWalletExtension : null
        case 'okx':
          return window.okxwallet?.isOkxWallet ? window.okxwallet : null
        case 'phantom':
          return window.phantom?.isPhantom ? window.phantom?.ethereum : null
        default:
          return null
      }
    }

    const provider = getProvider(walletType)

    if (!wallet.detector()) {
      throw new Error(`${wallet.name} not detected`)
    }
    // if(!window || !window?.ethereum){
    //   // TODO 提示用户安装钱包
    //   console.log('请先安装钱包')
    //   return
    // }
// async function connectMetaMask() {
//   const metamaskProvider = getRealMetaMask();

//   if (metamaskProvider) {
//     try {
//       const accounts = await metamaskProvider.request({ 
//         method: "eth_requestAccounts" 
//       });
//       return accounts;
//     } catch (error) {
//       console.error("MetaMask 连接错误:", error);
//       throw error;
//     }
//   } else {
//     const walletsAvailable = [];
//     if (window.ethereum?.isCoinbaseWallet) walletsAvailable.push("Coinbase Wallet");
//     if (window.okxwallet) walletsAvailable.push("OKX Wallet");
//     if (window.web3?.currentProvider === window.coinbaseWalletExtension) {
//       walletsAvailable.push("Coinbase Wallet (Legacy)");
//     }

//     const message = `
//       ⚠️ **检测到钱包冲突！**
      
//       当前 ${walletsAvailable.join(", ") || "其他钱包"} 阻碍了 MetaMask 的连接。  
//       **请执行以下操作：**
      
//       1. 点击浏览器扩展图标（🔌）
//       2. **禁用 ${walletsAvailable.join("、")}**
//       3. 刷新页面
//       4. 重试连接 MetaMask
//     `;

//     console.error(message);
//     throw new Error("WALLET_CONFLICT");
//   }
// }




    try {
      // const accounts = await window.ethereum!.request({ method: 'eth_requestAccounts' })
      const accounts = await provider!.request({ method: 'eth_requestAccounts' })
      console.log("====", accounts)
      const chainId = await provider!.request({ method: 'eth_chainId' })
      setWalletState({
        account: accounts[0],
        chainId,
        isConnected: true,
      })
    } catch (error) {
      // TODO 提示用户连接钱包失败
      console.log('连接钱包失败', error)
    }
  }

  const disconnectWallet = () => {
    setWalletState({
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

