import { SUPPORTED_CHAINS } from '../constants/chains'

export function useChains() {
  const switchChain = async (chainId: number) => {
    console.log("`0x${chainId.toString(16)}`===", `0x${chainId.toString(16)}`)
    try {
      await window.ethereum!.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chainId.toString(16)}` }]
      })
    } catch (error) {
      // 如果链未添加，则添加该链
      if ((error as { code: number }).code === 4902) {
        await addChain(chainId)
      }
    }
  }

  const addChain = async (chainId: number) => {
    const chain = Object.values(SUPPORTED_CHAINS).find(c => c.id === chainId)
    if (!chain) throw new Error('Unsupported chain')

    await window.ethereum!.request({
      method: 'wallet_addEthereumChain',
      params: [{
        chainId: `0x${chain.id.toString(16)}`,
        chainName: chain.name,
        rpcUrls: [chain.rpcUrl]
      }]
    })
  }

  return { switchChain, supportedChains: SUPPORTED_CHAINS }
}
