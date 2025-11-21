import { createConfig, fallback, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'

export const config = createConfig({
  chains: [mainnet, sepolia],
  transports: {
    [mainnet.id]: http(),
    // [sepolia.id]: http(),
    [sepolia.id]: fallback([
      http(process.env.SEPOLIA_RPC_URL),
      http() // 默认公共RPC
    ]),
  },
})