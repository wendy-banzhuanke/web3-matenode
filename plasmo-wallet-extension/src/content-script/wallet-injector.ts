import { HDNodeWallet, parseEther } from "ethers"

import { currentEVN, NETWORKS, useWalletStore } from "../stores/wallet"

class WendyEthereumProvider {
  wallet: HDNodeWallet

  constructor(wallet: HDNodeWallet) {
    this.wallet = wallet
  }

  request({ method, params }: { method: string; params?: any[] }) {
    switch (method) {
      case "eth_sendTransaction":
        if (!params?.[0]) throw new Error("Missing transaction parameters")
        return this.sendTransaction(params[0])

      case "eth_getBalance":
        const [address] = params || []
        return this.getBalance(address || this.wallet.address)

      case "eth_accounts":
        return [this.wallet.address]

      case "eth_chainId":
        return `0x${NETWORKS[currentEVN].chainId.toString(16)}`

      default:
        throw new Error(`Method ${method} not supported`)
    }
  }

  async sendTransaction(tx: { to: string; value: string }) {
    const { transferETH } = useWalletStore.getState()

    await transferETH(tx.to, tx.value)

    return useWalletStore.getState().transferStatus.txHash
  }

  async getBalance(address: string) {
    // address: string
    const { fetchBalances } = useWalletStore.getState()
    await fetchBalances()
    const balance = useWalletStore.getState().ethBalance
    return parseEther(balance).toString()
  }
}

function initWalletInjection() {
  console.log("initWalletInjection-001");
  const { wallet } = useWalletStore.getState()
  console.log("initWalletInjection-002:", wallet);
  if (!wallet) {
    console.warn("钱包未初始化");
    return;
  }

  const provider = new WendyEthereumProvider(wallet)

  Object.defineProperty(window, "wendyEthereum", {
    value: {
      request: provider.request.bind(provider),
      isWendyWallet: true,
      chainId: `0x${NETWORKS[currentEVN].chainId.toString(16)}`,
      selectedAddress: wallet.address
    },
    configurable: false,
    writable: false
  })

  console.log("window-wendyEthereum", (window as any).wendyEthereum)
}

// 监听钱包状态变化
let isInjected = false
useWalletStore.subscribe((state) => {
  if (state.wallet && !isInjected) {
    initWalletInjection();
    isInjected = true;
  }
});
