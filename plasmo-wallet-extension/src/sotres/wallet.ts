import { create } from "zustand"
import * as bip39 from "bip39"
import { HDNodeWallet } from "ethers"

interface WalletStore {
  menmonic: string | null
  address: string | null
  wallet?: HDNodeWallet | null
  setMenmonic: (menmonic: string) => void
  setAddress: (address: string) => void
  createWallet: () => Promise<void>
}

const DEFAULT_HD_PATH = "m/44'/60'/0'/0/0"

export const useWalletStore = create<WalletStore>((set) => ({
  menmonic: null,
  address: null,
  wallet: null,
  setMenmonic: (menmonic) => set({ menmonic }),
  setAddress: (address) => set({ address }),
  createWallet: async () => {
    const menmonic = await bip39.generateMnemonic(128);
    set({ menmonic }) 
    const wallet = await HDNodeWallet.fromPhrase(menmonic, "", DEFAULT_HD_PATH);
    const walletObj = { ...wallet, privateKey: wallet.privateKey };
    set({ wallet: walletObj as HDNodeWallet });
  }
}))


