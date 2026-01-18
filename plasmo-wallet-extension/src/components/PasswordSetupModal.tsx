import { useState, useEffect } from "react"
import { useWalletStore, LOCK_TIMEOUT } from "~stores/wallet"
export default function PasswordSetupModal({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const { initializeWallet, wallet } = useWalletStore()

  // 在组件中使用
  useEffect(() => {
    const timer = setTimeout(() => {
        useWalletStore.getState().lockWallet()
    }, LOCK_TIMEOUT)
    return () => clearTimeout(timer)
  }, [])

  const handleSubmit = async () => {
    if (!wallet?.address) return
    
    if (password !== confirmPassword) {
      setError("密码不一致")
      return
    }
    
    if (password.length < 8) {
      setError("密码至少需要8位字符")
      return
    }
    await initializeWallet(password)
    setError("") // 清空错误
    onClose()
  }

  return (
    <div className="plasmo-fixed plasmo-inset-0 plasmo-bg-black plasmo-bg-opacity-50 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-h-[600px] plasmo-w-[380px]">
      <div className="plasmo-bg-white plasmo-p-6 plasmo-rounded-lg plasmo-w-80">
        <h3 className="plasmo-text-lg plasmo-font-bold">设置钱包密码</h3>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="输入密码（至少8位）"
          className="plasmo-w-full plasmo-p-2 plasmo-mt-3 plasmo-border plasmo-rounded"
        />
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="确认密码"
          className="plasmo-w-full plasmo-p-2 plasmo-mt-3 plasmo-border plasmo-rounded"
        />
        {error && <p className="plasmo-text-red-500 plasmo-mt-2">{error}</p>}
        <button
          onClick={handleSubmit}
          className="plasmo-mt-4 plasmo-bg-blue-500 plasmo-text-white plasmo-px-4 plasmo-py-2 plasmo-rounded">
          确认
        </button>
      </div>
    </div>
  )
}