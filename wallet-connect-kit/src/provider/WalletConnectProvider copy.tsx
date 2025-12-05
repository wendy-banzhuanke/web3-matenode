'use client'
import { useState, useEffect } from 'react'
import { WalletContext, type WalletState } from '../context/WalletContext'
import { SUPPORTED_WALLETS, type WalletType } from '../constants/wallets'
import type { EthereumProvider } from '../type/ethereum'

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

  useEffect(() => {
    const provider = walletState.provider || window.ethereum;
    if (!provider) return;

    let unsubscribe: (() => void) | null = null;
    let balanceCheckInterval: number | null = null;

    // 启动余额监控
    const startBalanceMonitoring = () => {
      // 先清除之前的监听
      stopBalanceMonitoring();

      if (!walletState.account) return;

      console.log('开始监控余额变化，当前账户:', walletState.account);

      // 方案A：优先尝试 eth_subscribe（更高效）
      const tryEthSubscribe = () => {
        provider.request({
          method: 'eth_subscribe',
          params: ['newHeads']
        }).then(subId => {
          console.log('已启用链上订阅模式');

          const subscriptionHandler = async () => {
            try {
              const balance = await provider.request({
                method: "eth_getBalance",
                params: [walletState.account, "latest"]
              });
              console.log('最新余额:', balance);
              // 这里可以添加余额状态更新逻辑
              setWalletState(prev => ({
                ...prev,
                balance: balance.toString()
              }));
            } catch (error) {
              console.error('获取余额出错:', error);
            }
          };

          // 监听订阅事件
          provider.on(subId, subscriptionHandler);

          // 设置取消订阅的函数
          unsubscribe = () => {
            console.log('取消链上订阅');
            provider.removeListener(subId, subscriptionHandler);
            provider.request({
              method: 'eth_unsubscribe',
              params: [subId]
            }).catch(console.error);
          };
        }).catch((err) => {
          console.log('链上订阅失败，尝试区块事件监听', err);
          tryBlockListener();
        });
      };

      // 方案B：次选区块事件监听
      const tryBlockListener = () => {
        if (typeof provider.on === 'function') {
          console.log('尝试使用区块事件监听');

          const blockHandler = async () => {
            try {
              const balance = await provider.request({
                method: "eth_getBalance",
                params: [walletState.account, "latest"]
              });
              console.log('新区块到达，最新余额:', balance);
              setWalletState(prev => ({
                ...prev,
                balance: balance.toString()
              }));
            } catch (error) {
              console.error('获取余额出错:', error);
            }
          };

          provider.on('block', blockHandler);
          unsubscribe = () => {
            console.log('移除区块监听');
            provider.removeListener('block', blockHandler);
          };
        } else {
          console.log('提供者不支持事件监听，降级到轮询');
          startPolling();
        }
      };

      // 方案C：降级到轮询
      const startPolling = () => {
        console.log('启动轮询模式，间隔5秒');
        
        const pollBalance = async () => {
          try {
            const balance = await provider.request({
              method: "eth_getBalance",
              params: [walletState.account, "latest"]
            });
            console.log('轮询获取余额:', balance);
            setWalletState(prev => ({
              ...prev,
              balance: balance.toString()
            }));
          } catch (error) {
            console.error('轮询获取余额出错:', error);
          }
        };

        // 立即执行一次
        pollBalance();
        
        // 设置定时轮询
        balanceCheckInterval = setInterval(pollBalance, 5000);
        unsubscribe = () => {
          console.log('清除轮询');
          if (balanceCheckInterval) clearInterval(balanceCheckInterval);
        };
      };

      // 开始尝试不同方案
      tryEthSubscribe();
    };

    // 停止余额监控
    const stopBalanceMonitoring = () => {
      if (unsubscribe) {
        unsubscribe();
        unsubscribe = null;
      }
      if (balanceCheckInterval) {
  clearInterval(balanceCheckInterval);
        balanceCheckInterval = null;
      }
    };

    const handleAccountsChanged = (accounts: string[]) => {
      console.log("账户变化:", accounts);
      
      const newAccount = accounts[0] || null;
      
      // 只有当账户确实变化时才更新状态和重新监听
      if (newAccount !== walletState.account) {
        setWalletState(prev => ({
          ...prev,
          account: newAccount,
          isConnected: accounts.length > 0,
          balance: '0' // 重置余额
        }));
        
        // 只在有新账户时启动监听
        if (newAccount) {
          startBalanceMonitoring();
        } else {
          stopBalanceMonitoring();
        }
      }
    };

    // 初始设置
    provider.on('accountsChanged', handleAccountsChanged);
    
    // 如果已经有账户连接，立即开始监听
    if (walletState.account) {
      startBalanceMonitoring();
    }

    // 清理函数
    return () => {
      console.log('清理余额监听');
      provider.removeListener?.('accountsChanged', handleAccountsChanged);
      stopBalanceMonitoring();
    };
  }, [walletState.provider, walletState.account]); // 添加walletState.account作为依赖


  // // 监听账户变化（兼容多钱包）
  // useEffect(() => {
  //   const provider = walletState.provider || window.ethereum;
  //   if (!provider) return;

  //   const handleAccountsChanged = (accounts: string[]) => {
  //     console.log("账户变化了----:", accounts);

  //     setWalletState(prev => ({
  //       ...prev,
  //       account: accounts[0] || null,
  //       isConnected: accounts.length > 0,
  //     }));
  //   };

  //   provider.on('accountsChanged', handleAccountsChanged);
  //   return () => provider.removeListener?.('accountsChanged', handleAccountsChanged);
  // }, [walletState.provider]);



  // 监听链变化
  useEffect(() => {
    const provider = walletState.provider || window.ethereum;
    if (!provider) return;

    const handleChainChanged = async (hexChainId: string ) => {
      console.log("chainChanged====", hexChainId)

      const chainId = parseInt(hexChainId, 16);
      console.log("切换到新链:", hexChainId, chainId);

      setWalletState(prev => ({...prev, chainId}))

      const balance = await provider.request({method: "eth_getBalance", params: [walletState.account, "latest"]});
      console.log("balance====", balance, walletState.account)
      setWalletState(prev => ({...prev, amount: balance, chainId}));
    }

    provider.on('chainChanged', handleChainChanged)

    return () => {
      provider.removeListener?.('chainChanged', handleChainChanged)
    }
  }, [walletState.provider, walletState.chainId, walletState.account])

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
  }, []);

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
