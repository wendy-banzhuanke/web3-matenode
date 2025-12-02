'use client'
 
import { useState, useEffect } from 'react' 
// import type { React.ReactNode } from 'react'
import { WalletContext, type WalletState } from '../context/WalletContext'
 
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

  const connectWallet = async () => {
    if(!window || !window?.ethereum){
      // TODO 提示用户安装钱包
      console.log('请先安装钱包')
      return
    }

    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      const chainId = await window.ethereum.request({ method: 'eth_chainId' })
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

