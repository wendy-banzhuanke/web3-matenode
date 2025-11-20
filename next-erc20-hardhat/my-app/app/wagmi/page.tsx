import { WagmiProvider } from 'wagmi'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import Link from 'next/link'
import Dashboard from './dashboard/page'
import { config } from '../../utils/wagmi/config'

export default function Wagmi() {
  const queryClient = new QueryClient()

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        进入主页：<Dashboard />
      </QueryClientProvider>
    </WagmiProvider>
  )
}