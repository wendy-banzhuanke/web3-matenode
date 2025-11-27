// /*
//  * @Author: zhangjian
//  * @Date: 2025-11-27 15:49:31
//  * @LastEditTime: 2025-11-27 15:50:04
//  * @LastEditors: zhangjian
//  * @Description: 描述
//  */

// import { getDefaultConfig } from '@rainbow-me/rainbowkit';
// import { http, createConfig } from 'wagmi';
// import { mainnet, polygon, arbitrum } from 'wagmi/chains';


// // 多链配置
// export const wagmiConfig = getDefaultConfig({
//   appName: 'My DApp',
//   projectId: PROJECT_ID,
//   chains: [mainnet, polygon, arbitrum],
//   transports: {
//     [mainnet.id]: http('https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY'),
//     [polygon.id]: http('https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY'),
//     [arbitrum.id]: http('https://arb-mainnet.g.alchemy.com/v2/YOUR_KEY'),
//   },
//   ssr: true // 启用SSR支持
// });

// // React Query 客户端
// export const queryClient = new QueryClient({
//   defaultOptions: {
//     queries: {
//       staleTime: 60 * 1000, // 1分钟缓存
//       gcTime: 300 * 1000,   // 5分钟垃圾回收
//       retryDelay: attemptIndex => Math.min(1000 * 2 ** attemptIndex, 30000),
//     }
//   }
// });

import { getDefaultConfig } from '@rainbow-me/rainbowkit';
import {
  // arbitrum,
  // base,
  mainnet,
  // optimism,
  // polygon,
  sepolia,
} from 'wagmi/chains';

export const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || '';

export const config = getDefaultConfig({
  appName: 'RainbowKit demo',
  projectId: PROJECT_ID,
  chains: [
    mainnet,
    
    ...(process.env.NEXT_PUBLIC_ENABLE_TESTNETS === 'true' ? [{
      ...sepolia,
      http: [process.env.NEXT_SEPOLIA_RPC_URL],
    }] : []),
  ],
  ssr: true,
});
