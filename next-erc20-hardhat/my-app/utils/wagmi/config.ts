import { createConfig, fallback, http } from 'wagmi'
import { mainnet, sepolia } from 'wagmi/chains'
import { walletConnect } from '@wagmi/connectors'


const projectId = process.env.PROJECT_ID_KEY ?? "";

export const config = createConfig({
  chains: [mainnet, sepolia],
  connectors: [
    walletConnect({
      projectId: projectId,
      showQrModal: true,
      metadata: {
        name: 'duoli-test',
        description: 'Test',
        url: 'http://localhost:3000',
        icons: ['https://example.com/icon.png']
      },
      logger: 'debug'
    })
  ],
  transports: {
    [mainnet.id]: http(),
    // [sepolia.id]: http(),
    [sepolia.id]: fallback([
      http(process.env.SEPOLIA_RPC_URL),
      http() // 默认公共RPC
    ]),
  },
})