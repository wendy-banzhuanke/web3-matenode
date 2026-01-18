import { useState } from "react"
import { useWalletStore } from "~stores/wallet"

export default function ClearWalletButton() {
  const clearWallet = useWalletStore((state) => state.clearWallet)
  const [isConfirming, setIsConfirming] = useState(false)

  const handleClear = async () => {
    if (!isConfirming) {
      setIsConfirming(true)
      return
    }

    if (!confirm("确定要清空所有钱包数据吗？此操作不可撤销！")) {
        return
    }
    
    await clearWallet()
    setIsConfirming(false)
    alert("钱包数据已清空")
  }

  return (
    <button 
      onClick={handleClear}
      className={`plasmo-p-2 plasmo-rounded ${
        isConfirming 
          ? "plasmo-bg-red-600 plasmo-text-white" 
          : "plasmo-bg-gray-200"
      }`}
    >
      {isConfirming ? "确认清空" : "清空钱包?"}
    </button>
  )
}
