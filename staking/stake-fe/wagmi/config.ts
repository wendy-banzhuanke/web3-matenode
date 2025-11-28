/*
 * @Author: zhangjian
 * @Date: 2025-11-27 15:49:31
 * @LastEditTime: 2025-11-28 15:40:29
 * @LastEditors: zhangjian
 * @Description: 描述
 */

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import { 
  metaMaskWallet,
  injectedWallet,
  rainbowWallet,
  walletConnectWallet 
} from '@rainbow-me/rainbowkit/wallets';
import { 
  mainnet,
  sepolia,
  // arbitrum, 
  // optimism,
  // base,
  // polygon 
} from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';

export const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || '';

const getDefaultChain = (): Chain => {
  const isTestnet = process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true';
  
  return isTestnet 
    ? {
        ...sepolia,
        rpcUrls: {
          default: { 
            http: [process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || sepolia.rpcUrls.default.http[0]] 
          }
        }
      }
    : mainnet;
};

export const config = getDefaultConfig({
  appName: 'RainbowKit Demo',
  projectId: PROJECT_ID,
  chains: [getDefaultChain()],
  wallets: [
    {
      groupName: 'Installed',
      wallets: [
        // injectedWallet,
        typeof window !== "undefined" && window?.ethereum?.isMetaMask
        ? metaMaskWallet
        : injectedWallet,
        ]
    },
    {
      groupName: 'Recommended',
      wallets: [
        typeof window !== "undefined" && window?.ethereum?.isMetaMask
        ? metaMaskWallet : injectedWallet,
        rainbowWallet,
        walletConnectWallet
      ]
    }
  ],
  ssr: true,
});