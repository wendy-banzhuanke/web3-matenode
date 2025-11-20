'use client'; // 必须标记为Client Component
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { config } from '../../utils/wagmi/config'

const queryClient = new QueryClient();

export default function WagmiLayout({
  children, // 会自动注入子页面
}: {
  children: React.ReactNode;
}) {
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        {/* 可以在这里添加wagmi专属的导航栏 */}
        {/* <nav>
          <a href="/wagmi/dashboard">Dashboard</a>
          <a href="/wagmi/mint">Mint</a>
        </nav> */}
        
        {/* 子页面内容会渲染在这里 */}
        {children} 
      </QueryClientProvider>
    </WagmiProvider>
  );
}
