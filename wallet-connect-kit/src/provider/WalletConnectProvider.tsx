'use client'
import { useState, useEffect } from 'react'
import { WalletContext, type WalletState } from '../context/WalletContext'
import { SUPPORTED_WALLETS, type WalletType } from '../constants/wallets'
import type { EthereumProvider } from '../type/index'

type Error = {
  code: number
  message: string
  stack?: string
} 

const INITIAL_STATE = {
  provider: null,
  account: null,
  chainId: null,
  isConnected: false,
  type: null,
  amount: null,
  symbol: null
}

export default function WalletConnectKitProvider({
  children,
}: {
  children: React.ReactNode
}) {
  // 初始化状态（从 sessionStorage 恢复）
  const [walletState, setWalletState] = useState<WalletState>(() => {
    if (typeof window === 'undefined') return INITIAL_STATE;
    
    const stored = sessionStorage.getItem('walletState');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          provider: getProvider(parsed?.type) // 重新获取 provider
        };
      } catch (e) {
        console.error('解析存储状态失败:', e);
        return INITIAL_STATE;
      }
    }
    return INITIAL_STATE;
  });

  // 状态变更时持久化
  useEffect(() => {
    sessionStorage.setItem('walletState', JSON.stringify({
      ...walletState,
      provider: null
    }));
  }, [walletState]);

  function getProvider(type: string) {
    switch (type) {
      case 'metamask': return window.ethereum?.isMetaMask ? window.ethereum : null;
      case 'coinbase': return window.coinbaseWalletExtension?.isCoinbaseWallet ? window.coinbaseWalletExtension : null;
      case 'okx': return window.okxwallet?.isOkxWallet ? window.okxwallet : null;
      case 'phantom': return window.phantom?.ethereum?.isPhantom ? window.phantom?.ethereum : null;
      default: return null;
    }
  }

  const connectWallet = async (walletType: string) => {
    const wallet = SUPPORTED_WALLETS[walletType.toUpperCase() as WalletType];
    if (!wallet.detector()) throw new Error(`${wallet.name} not detected`);

    const provider = getProvider(walletType);
    if (!provider) return;

    try {
      const accounts = await provider.request({ method: 'eth_requestAccounts'});
      if (!accounts.length) return;
      
      const chainId = await provider!.request({ method: 'eth_chainId' })
      const balance = await provider!.request({ method: "eth_getBalance", params: [accounts[0], "latest"] }); // "latest" 表示最新区块

      const symbol = getNativeCurrencySymbol(chainId);
      setWalletState({
        provider,
        account: accounts[0],
        amount:  balance, // BigInt(balance),
        symbol,
        chainId: parseInt(chainId, 16),
        isConnected: true,
        type: walletType,
      });

    } catch (error: unknown) {
      console.error('连接钱包失败', error);
      if ((error as Error)?.code === 4001) alert('用户拒绝了连接请求');
    }
  };

  const disconnectWallet = async () => {
    const { provider, type } = walletState;
    if (!provider) return;

    try {
      if (type === 'metamask') {
        await provider.request({ method: 'wallet_revokePermissions', params: [{ eth_accounts: {} }]});
      } else if (['coinbase', 'okx', 'phantom'].includes(type as string)) {
        await provider.disconnect?.();
      }
    } finally {
      sessionStorage.removeItem('walletState');
      setWalletState(INITIAL_STATE);
    }
  };

  // 监听账户变化
  useEffect(() => {
    const provider = walletState.provider || window.ethereum;
    if (!provider) return;

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("切换到新账户:", accounts[0]);
      
      setWalletState(prev => ({
        ...prev,
        account: accounts[0] || null,
        isConnected: accounts.length > 0,
      }));
    };

    provider.on('accountsChanged', handleAccountsChanged);
    return () => provider.removeListener?.('accountsChanged', handleAccountsChanged);
  }, [walletState.provider]);

  // 监听链变化
  useEffect(() => {
    const provider = walletState.provider || window.ethereum;
    if (!provider) return;

    const handleChainChanged = async (hexChainId: string ) => {
      const chainId = parseInt(hexChainId, 16);
      console.log("切换到新链:", hexChainId, chainId);

      setWalletState(prev => ({...prev, chainId}))

      const balance = await provider.request({method: "eth_getBalance", params: [walletState.account, "latest"]});
      setWalletState(prev => ({...prev, amount: balance, chainId}));
    }

    provider.on('chainChanged', handleChainChanged)

    return () => {
      provider.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [walletState.provider, walletState.account])

  // 初始化时自动重连
  useEffect(() => {
    if (walletState.isConnected && walletState.type) {
      const provider = getProvider(walletState.type);
      if (provider) setWalletState(prev => ({ ...prev, provider }));
    }
    
    const tryReconnect = async () => {
      const provider = window.ethereum || window.coinbaseWalletExtension || window.okxwallet;
      if (!provider) return;
      
      try {
        const accounts = await provider.request({ method: 'eth_accounts' });
        if (accounts.length) {
          const chainIdHex = await provider.request({ method: 'eth_chainId' });
          const chainId = parseInt(chainIdHex, 16);
          setWalletState(prev => ({
            ...prev,
            account: accounts[0],
            chainId,
            isConnected: true,
            type: detectWalletType(provider),
          }));
        }
        
      } catch (error) {
        console.log('自动重连失败:', error);
      }
    };

    tryReconnect();
  }, [walletState.isConnected, walletState.type]);

  // 工具函数
  function getNativeCurrencySymbol(chainId: string) {
    const chainIdNum = parseInt(chainId, 16);
    return {
      1: "ETH",
      56: "BNB",
      137: "MATIC",
      10: "ETH",
      1155111: "ETH",
      31337: "ETH",
    }[chainIdNum] ?? "ETH";
  }

  function detectWalletType(provider: EthereumProvider): WalletType | null {
    if (provider.isMetaMask) return 'metamask' as WalletType;
    if (provider.isCoinbaseWallet) return 'coinbase' as WalletType;
    if (provider.isOkxWallet) return 'okx' as WalletType;
    if (provider.isPhantom) return 'phantom' as WalletType;
    return null;
  }

  return (
    <WalletContext.Provider value={{
      ...walletState,
      connectWallet,
      disconnectWallet,
    }}>
      {children}
    </WalletContext.Provider>
  );
}
