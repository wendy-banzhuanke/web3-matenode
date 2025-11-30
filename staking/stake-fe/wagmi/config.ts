/*
 * @Author: zhangjian
 * @Date: 2025-11-27 15:49:31
 * @LastEditTime: 2025-11-29 14:02:55
 * @LastEditors: zhangjian
 * @Description: wagmi 配置
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
  localhost
  // arbitrum, 
  // optimism,
  // base,
  // polygon 
} from 'wagmi/chains';
import type { Chain } from 'wagmi/chains';

export const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || '';

// const getDefaultChain = (): Chain => {
//   const isLocalhost = process.env.NEXT_PUBLIC_ENABLE_LOCALHOST === 'true';
//   const isTestnet = process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true';
  
//   return isLocalhost ? {
//       ...localhost,
//       id: 31337, // Hardhat 默认链 ID
//       name: "Localhost",
//       nativeCurrency: {
//         decimals: 18,
//         name: "Ether",
//         symbol: "ETH",
//       },
//       rpcUrls: {
//         default: { 
//           http: ["http://localhost:8545"] 
//         },
//         public: { 
//           http: ["http://localhost:8545"] 
//         },
//       },
//       testnet: true // 标记为测试网
//     } : isTestnet 
//     ? {
//         ...sepolia,
//         rpcUrls: {
//           default: { 
//             http: [process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || sepolia.rpcUrls.default.http[0]] 
//           }
//         }
//       }
//     : mainnet;
// };

export const config = getDefaultConfig({
  appName: 'RainbowKit Demo',
  projectId: PROJECT_ID,
  // chains: [getDefaultChain()],
  chains: [{
      ...sepolia,
      rpcUrls: {
        default: { 
          http: [process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || sepolia.rpcUrls.default.http[0]] 
        }
      },
      pollingInterval: 4000, // 每 4 秒检查新区块
    }, {
      ...localhost,
      id: 31337, // Hardhat 默认链 ID
      name: "Localhost",
      nativeCurrency: {
        decimals: 18,
        name: "Ether",
        symbol: "ETH",
      },
      rpcUrls: {
        default: { 
          http: ["http://localhost:8545"] 
        },
        public: { 
          http: ["http://localhost:8545"] 
        },
      },
      testnet: true // 标记为测试网
    }, {
      ...mainnet
    }
  ],
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