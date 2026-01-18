import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"
import * as bip39 from "bip39"
import { HDNodeWallet, JsonRpcProvider, formatEther, parseUnits, parseEther, Wallet, Contract } from "ethers"
import { encryptData, decryptData } from "../utils/crypto"

type NetworkKey = "sepolia" | "mainnet"

interface WalletStore {
  mnemonic: string | null
  address: string | null
  wallet?: HDNodeWallet | null
  isInitialized: boolean,

  ethBalance: string
  tokenBalances: TokenBalance[]
  loadingBalances: boolean,

  transferStatus: {
    loading: boolean
    pending: boolean  // 交易已发送到内存池，但未确认，Archemy 显示pending
    success: boolean  // 交易已被区块链确认，区块浏览器中可以查看了
    error: string | null
    txHash: string | null
  }

  activeNetworkKey: NetworkKey
  activeChainId: number

  setMnemonic: (mnemonic: string) => void
  setAddress: (address: string) => void
  createWallet: () => Promise<void>
  initializeWallet: (password: string) => Promise<void>
  lockWallet: () => void
  clearWallet: () => Promise<void>,

  fetchBalances: () => Promise<void>,

  transferETH: (to: string, amount: string) => Promise<void>
  transferERC20: (tokenAddress: string, to: string, amount: string) => Promise<void>
  transferERC721: (tokenAddress: string, to: string, tokenId: string) => Promise<void>
  resetTransferStatus: () => void

  getExplorerTxUrl: (txHash: string) => string

  receiptCheck: (txHash?: string) => Promise<boolean>
  checkPendingTransaction: (txHash: string) => Promise<any>
  speedUpTransaction: (txHash: string) => Promise<void>
  cancelTransaction: (txHash: string) => Promise<void>
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
} satisfies Record<NetworkKey, { chainId: number; rpc: string }>

const EXPLORER_BASE_URLS: Record<number, string> = {
  1: "https://etherscan.io",
  11155111: "https://sepolia.etherscan.io"
}

const createProvider = () => {
  return new JsonRpcProvider(NETWORKS[currentEVN].rpc, NETWORKS[currentEVN].chainId)
}

const createSigner = (privateKey: string) => {
  const provider = createProvider()
  return new Wallet(privateKey, provider)
}

const getErrorMessage = (error: unknown): string => {
  if (typeof error === "object" && error !== null) {
    const maybeShort = (error as { shortMessage?: unknown }).shortMessage
    if (typeof maybeShort === "string" && maybeShort.trim()) return maybeShort
    const maybeMessage = (error as { message?: unknown }).message
    if (typeof maybeMessage === "string" && maybeMessage.trim()) return maybeMessage
  }
  if (typeof error === "string") return error
  try {
    return JSON.stringify(error)
  } catch {
    return "未知错误"
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

      transferStatus: {
        loading: false,
        pending: false,
        success: false,
        error: null,
        txHash: null
      },

      activeNetworkKey: currentEVN,
      activeChainId: NETWORKS[currentEVN].chainId,
      getExplorerTxUrl: (txHash: string) => {
        const chainId = NETWORKS[currentEVN].chainId
        const base = EXPLORER_BASE_URLS[chainId] ?? "https://etherscan.io"
        return `${base}/tx/${txHash}`
      },

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
          const provider = createProvider()

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
      },

      // ETH转账
      transferETH: async (to, amount) => {
        const { wallet } = get()
        if (!wallet) throw new Error("钱包未解锁")

        let submittedTxHash: string | null = null

        set({
          transferStatus: {
            loading: true,
            pending: false,
            success: false,
            error: null,
            txHash: null
          }
        })

        try {
          const provider = createProvider()
          const signer = createSigner(wallet.privateKey)

          const nonce = await provider.getTransactionCount(wallet.address, "pending")

          const feeData = await provider.getFeeData()

          const finalMaxPriorityFee = parseUnits("2", "gwei")  
          const finalMaxFee = parseUnits("5", "gwei")         

          const tx = await signer.sendTransaction({
            to,
            value: parseEther(amount),
            nonce,
            gasLimit: 300000, 
            maxPriorityFeePerGas: finalMaxPriorityFee,
            maxFeePerGas: finalMaxFee,
            type: 2 // EIP-1559交易
          })

          console.log("ETH转账-tx: ", feeData, tx)
          submittedTxHash = tx.hash

          set({
            transferStatus: {
              loading: false,
              pending: true,
              success: false,
              error: null,
              txHash: tx.hash
            }
          })

          const receipt = await Promise.race([
            tx.wait(1),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("交易确认超时，但交易已提交")), 120000)
            )
          ])

          console.log("ETH转账-receipt: ", receipt)

          if (!receipt) {
            throw new Error("交易确认失败")
          }

          set({
            transferStatus: {
              loading: false,
              pending: false,
              success: true,
              error: null,
              txHash: tx.hash
            }
          })

          get().fetchBalances() // 刷新余额
        } catch (error) {
          const errorMsg = getErrorMessage(error)

          const isPending = submittedTxHash && errorMsg.includes("超时")

          console.log("send-error:", error)

          set({
            transferStatus: {
              loading: false,
              pending: isPending,
              success: false,
              error: isPending ? "交易正在确认中，请稍后查看" : errorMsg,
              txHash: submittedTxHash
            }
          })
        }
      },

      // ERC20转账
      transferERC20: async (tokenAddress, to, amount) => {
        const { wallet } = get()
        if (!wallet) throw new Error("钱包未解锁")

        let submittedTxHash: string | null = null

        set({ transferStatus: { loading: true, pending: false, success: false, error: null, txHash: null } })

        try {
          const signer = createSigner(wallet.privateKey)

          const contract = new Contract(
            tokenAddress,
            [
              "function transfer(address to, uint256 amount) returns (bool)",
              "function decimals() view returns (uint8)"
            ],
            signer
          )

          const decimals = await contract.decimals()
          const tx = await contract.transfer(to, parseUnits(amount, decimals))
          submittedTxHash = tx.hash

          set({
            transferStatus: {
              loading: false,
              pending: true,
              success: false,
              error: null,
              txHash: tx.hash
            }
          })

          await Promise.race([
            tx.wait(1),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("交易确认超时，但交易已提交")), 120000)
            )
          ])

          set({
            transferStatus: {
              loading: false,
              pending: false,
              success: true,
              error: null,
              txHash: tx.hash
            }
          })

          get().fetchBalances() // 刷新余额
        } catch (error) {
          const errorMsg = getErrorMessage(error)
          const isPending = submittedTxHash && errorMsg.includes("超时")

          set({
            transferStatus: {
              loading: false,
              pending: isPending,
              success: false,
              error: isPending ? "交易正在确认中，请稍后查看" : errorMsg,
              txHash: submittedTxHash
            }
          })
        }
      },
      
      // ERC721转账
      transferERC721: async (tokenAddress, to, tokenId) => {
        const { wallet } = get()
        if (!wallet) throw new Error("钱包未解锁")

        let submittedTxHash: string | null = null

        set({ transferStatus: { loading: true, pending: false, success: false, error: null, txHash: null } })

        try {
          const signer = createSigner(wallet.privateKey)

          const contract = new Contract(
            tokenAddress,
            [
              "function safeTransferFrom(address from, address to, uint256 tokenId)"
            ],
            signer
          )

          const tx = await contract.safeTransferFrom(wallet.address, to, tokenId)
          submittedTxHash = tx.hash

          set({
            transferStatus: {
              loading: false,
              pending: true,
              success: false,
              error: null,
              txHash: tx.hash
            }
          })

          const receipt = await Promise.race([
            tx.wait(1),
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("交易确认超时，但交易已提交")), 120000)
            )
          ])

          set({
            transferStatus: {
              loading: false,
              pending: false,
              success: true,
              error: null,
              txHash: tx.hash
            }
          })

          get().fetchBalances() // 刷新余额
        } catch (error) {
          const errorMsg = getErrorMessage(error)
          const isPending = submittedTxHash && errorMsg.includes("超时")

          set({
            transferStatus: {
              loading: false,
              pending: isPending,
              success: false,
              error: isPending ? "交易正在确认中，请稍后查看" : errorMsg,
              txHash: submittedTxHash
            }
          })
        }
      },
      
      resetTransferStatus: () => {
        set({
          transferStatus: {
            loading: false,
            pending: false,
            success: false,
            error: null,
            txHash: null
          }
        })

        console.log("resetTransferStatus", get().transferStatus.loading)
      },
      
      receiptCheck: async (txHash?: string) => {
        const provider = createProvider()
        const hash = txHash || get().transferStatus.txHash
        if (!hash) return false

        const txReceipt = await provider.getTransactionReceipt(hash)
        console.log("receiptCheck-txReceipt: ", txReceipt)
        return txReceipt !== null
      },

      // 检查pending交易详情
      checkPendingTransaction: async (txHash: string) => {
        const provider = createProvider()

        try {
          const tx = await provider.getTransaction(txHash)
          if (!tx) {
            return { status: 'not_found', message: '交易未找到' }
          }

          const receipt = await provider.getTransactionReceipt(txHash)
          if (receipt) {
            return {
              status: 'confirmed',
              message: '交易已确认',
              blockNumber: receipt.blockNumber,
              gasUsed: receipt.gasUsed.toString()
            }
          }

          // 交易还在pending
          const currentBlock = await provider.getBlockNumber()
          const feeData = await provider.getFeeData()

          return {
            status: 'pending',
            message: '交易待确认',
            nonce: tx.nonce,
            gasPrice: tx.gasPrice?.toString(),
            maxFeePerGas: tx.maxFeePerGas?.toString(),
            maxPriorityFeePerGas: tx.maxPriorityFeePerGas?.toString(),
            currentBaseFee: feeData.gasPrice?.toString(),
            networkMaxFee: feeData.maxFeePerGas?.toString(),
            currentBlock
          }
        } catch (error) {
          console.error('检查交易失败:', error)
          return { status: 'error', message: getErrorMessage(error) }
        }
      },

      // 加速交易（提高gas费）， 使用相同的nonce，替换原交易
      speedUpTransaction: async (txHash: string) => {
        const { wallet } = get()
        if (!wallet) throw new Error("钱包未解锁")

        try {
          const provider = createProvider()
          const signer = createSigner(wallet.privateKey)

          const originalTx = await provider.getTransaction(txHash)
          if (!originalTx) throw new Error("原始交易未找到")

          const receipt = await provider.getTransactionReceipt(txHash)
          if (receipt) throw new Error("交易已确认，无需加速")

          const feeData = await provider.getFeeData()

          const oldMaxFeePerGas = originalTx.maxFeePerGas ?? parseUnits("50", "gwei")
          const oldMaxPriorityFee = originalTx.maxPriorityFeePerGas ?? parseUnits("2", "gwei")

          const newMaxFeePerGas = (oldMaxFeePerGas * 30n) / 10n // 提高3倍
          const newMaxPriorityFee = (oldMaxPriorityFee * 30n) / 10n // 提高3倍

          console.log("加速交易-原始gas:", {
            maxFeePerGas: oldMaxFeePerGas.toString(),
            maxPriorityFee: oldMaxPriorityFee.toString()
          })
          console.log("加速交易-新gas:", {
            maxFeePerGas: newMaxFeePerGas.toString(),
            maxPriorityFee: newMaxPriorityFee.toString()
          })

          const newTx = await signer.sendTransaction({
            to: originalTx.to,
            value: originalTx.value,
            data: originalTx.data,
            nonce: originalTx.nonce, // 使用相同的nonce，替换原交易
            maxFeePerGas: newMaxFeePerGas,
            maxPriorityFeePerGas: newMaxPriorityFee,
            type: 2
          })

          console.log("加速-交易已发送:", newTx.hash)

          set({
            transferStatus: {
              loading: false,
              pending: true,
              success: false,
              error: null,
              txHash: newTx.hash
            }
          })

          const newReceipt = await newTx.wait(1)
          console.log("加速-交易已确认:", newReceipt)

          set({
            transferStatus: {
              loading: false,
              pending: false,
              success: true,
              error: null,
              txHash: newTx.hash
            }
          })

          get().fetchBalances()
        } catch (error) {
          console.log('加速-交易失败:', error)
          set({
            transferStatus: {
              ...get().transferStatus,
              error: '加速失败: ' + getErrorMessage(error)
            }
          })
          throw error
        }
      },

      // 取消交易（发送0 ETH给自己，使用相同nonce）
      cancelTransaction: async (txHash: string) => {
        const { wallet } = get()
        if (!wallet) throw new Error("钱包未解锁")

        try {
          const provider = createProvider()
          const signer = createSigner(wallet.privateKey)

          const originalTx = await provider.getTransaction(txHash)
          if (!originalTx) throw new Error("原始交易未找到")

          const receipt = await provider.getTransactionReceipt(txHash)
          if (receipt) throw new Error("交易已确认，无法取消")

          const feeData = await provider.getFeeData()
          const oldMaxFeePerGas = originalTx.maxFeePerGas ?? parseUnits("50", "gwei")
          const oldMaxPriorityFee = originalTx.maxPriorityFeePerGas ?? parseUnits("2", "gwei")

          // 提高gas费以确保取消交易优先
          const newMaxFeePerGas = (oldMaxFeePerGas * 30n) / 10n
          const newMaxPriorityFee = (oldMaxPriorityFee * 30n) / 10n

          // 发送0 ETH给自己，使用相同nonce
          const cancelTx = await signer.sendTransaction({
            to: wallet.address, // 发送给自己
            value: 0n, // 0 ETH
            nonce: originalTx.nonce, // 相同nonce
            maxFeePerGas: newMaxFeePerGas,
            maxPriorityFeePerGas: newMaxPriorityFee,
            type: 2
          })

          console.log("取消-交易已发送:", cancelTx.hash)

          set({
            transferStatus: {
              loading: false,
              pending: true,
              success: false,
              error: null,
              txHash: cancelTx.hash
            }
          })

          await cancelTx.wait(1)

          set({
            transferStatus: {
              loading: false,
              pending: false,
              success: true,
              error: null,
              txHash: cancelTx.hash
            }
          })

        } catch (error) {
          console.error('取消-交易失败:', error)
          throw error
        }
      },
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
