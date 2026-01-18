import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import * as bip39 from "bip39"
import { HDNodeWallet, JsonRpcProvider, formatEther } from "ethers"
import { encryptData, decryptData } from "../utils/crypto"

interface WalletStore {
  mnemonic: string | null
  address: string | null
  wallet?: HDNodeWallet | null
  isInitialized: boolean,
  ethBalance: string
  tokenBalances: TokenBalance[]
  loadingBalances: boolean,
  setMnemonic: (mnemonic: string) => void
  setAddress: (address: string) => void
  createWallet: () => Promise<void>
  initializeWallet: (password: string) => Promise<void>
  lockWallet: () => void
  clearWallet: () => Promise<void>,
  fetchBalances: () => Promise<void>
}

interface TokenBalance {
  contractAddress: string
  symbol: string
  balance: string
}

const currentEVN = 'sepolia' // TODO
const NETWORKS = {
  sepolia: {
    chainId: 11155111,
    rpc: "https://eth-sepolia.g.alchemy.com/v2/WFvF03dNhdfLqcGeWwSNH"
  },
  mainnet: {
    chainId: 1,
    rpc: "https://eth-mainnet.g.alchemy.com/v2/YOUR_KEY"
  }
}
const DEFAULT_HD_PATH = "m/44'/60'/0'/0/0"
export const LOCK_TIMEOUT = 30 * 60 * 1000 // 30分钟

export const useWalletStore = create<WalletStore>()(
  persist(
    (set, get) => ({
      mnemonic: null,
      address: null,
      wallet: null,
      isInitialized: false,

      ethBalance: "0",
      tokenBalances: [],
      loadingBalances: false,

      createWallet: async () => {
        const mnemonic = await bip39.generateMnemonic()
        const wallet = HDNodeWallet.fromPhrase(mnemonic, "", DEFAULT_HD_PATH)
        const walletObj = { ...wallet, privateKey: wallet.privateKey };
        set({ 
        //   mnemonic,
        //   address: wallet.address 
          // mnemonic: encryptData(mnemonic, "用户自定义密码"), // 助记词
          mnemonic,  // 先不加密，等待用户设置密码
          address: wallet.address, // 因为地址是公开的，所以不需要加密
          wallet: walletObj as HDNodeWallet
        })
      },
      initializeWallet: async (password: string) => {
        const { mnemonic, wallet } = get()
        if (!mnemonic || !wallet) throw new Error("钱包未创建")
        
        set({
          mnemonic: encryptData(mnemonic, password), // 正式加密
          isInitialized: true
        })
      },
      verifyPassword: async (password: string) => {
        const { mnemonic } = get()
        if (!mnemonic) return false
        
        try {
          const decrypted = decryptData(mnemonic, password)
          return !!decrypted
        } catch {
          return false
        }
      },
      clearWallet: async () => {
        set({
          mnemonic: null,
          address: null,
          wallet: null,
          isInitialized: false
        })
        await chrome.storage.local.remove("wendy-wallet-storage")
      },
      lockWallet: () => set({ mnemonic: null }),
      setMnemonic: (mnemonic) => set({ mnemonic }),
      setAddress: (address) => set({ address }),
      fetchBalances: async () => {
        const { address } = get()
        if (!address) return
        
        set({ loadingBalances: true })
        
        try {
          const provider = new JsonRpcProvider(NETWORKS[currentEVN].rpc, NETWORKS[currentEVN].chainId)
          
          console.log("provider===", provider)

          const ethBalance = await provider.getBalance(address)
          const formattedEth = formatEther(ethBalance)

          console.log("ethBalance===", ethBalance)
          
          // const commonTokens = [
          //   { address: "0xdAC17F958D2ee523a2206206994597C13D831ec7", symbol: "USDT" },
          //   { address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48", symbol: "USDC" }
          // ]
          
          // const tokenBalances = await Promise.all(
          //   commonTokens.map(async (token) => {
          //     const contract = new ethers.Contract(
          //       token.address,
          //       ["function balanceOf(address) view returns (uint256)"],
          //       provider
          //     )
          //     const balance = await contract.balanceOf(address)
          //     return {
          //       contractAddress: token.address,
          //       symbol: token.symbol,
          //       balance: ethers.formatUnits(balance, 6) // 假设默认6位小数
          //     }
          //   })
          // )
          
          set({
            ethBalance: formattedEth,
            tokenBalances: [],
            loadingBalances: false
          })
        } catch (error) {
          console.error("获取余额失败:", error)
          set({ loadingBalances: false })
        }
      }
    }),
    {
      name: "wendy-wallet-storage",
      storage: createJSONStorage(() => ({
        async getItem(key: string) {
          return (await chrome.storage.local.get(key))[key]
        },
        async setItem(key: string, value: string) {
          await chrome.storage.local.set({ [key]: value })
        },
        async removeItem(key: string) {
          await chrome.storage.local.remove(key)
        },
      })),
    }
  ),
)

// export const useWalletStore = create<WalletStore>((set) => ({
//   mnemonic: null,
//   address: null,
//   wallet: null,
//   setMnemonic: (mnemonic) => set({ mnemonic }),
//   setAddress: (address) => set({ address }),
//   createWallet: async () => {
//     const mnemonic = await bip39.generateMnemonic(128);
//     set({ mnemonic }) 
//     const wallet = await HDNodeWallet.fromPhrase(mnemonic, "", DEFAULT_HD_PATH);
//     const walletObj = { ...wallet, privateKey: wallet.privateKey };
//     set({ wallet: walletObj as HDNodeWallet });
//   }
// }))


