import { useEffect, useState } from "react"
import { useWalletStore } from "~stores/wallet"
import Dashboard from "./components/dashboard"
import PasswordSetupModal from "./components/PasswordSetupModal"

import "~style.css"

function IndexPopup() {
  const { createWallet, wallet, isInitialized } = useWalletStore()
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  console.log("isInitialized", isInitialized, wallet)

  return (
    // plasmo-flex plasmo-flex-column plasmo-items-center 
    <div className="plasmo-p-4 plasmo-justify-center plasmo-h-[600px] plasmo-w-[380px]">
      <div className="plasmo-mt-4">
        {!wallet ? (
          <button 
            onClick={async () => {
              await createWallet()
              setShowPasswordModal(true)
            }}
            className="plasmo-p-2 plasmo-bg-blue-500 plasmo-text-white plasmo-rounded">
            创建钱包
          </button>
        ) : isInitialized ? (
          <Dashboard />
        ) : (
          <PasswordSetupModal onClose={() => setShowPasswordModal(false)} />
        )}
        
        {showPasswordModal && <PasswordSetupModal onClose={() => setShowPasswordModal(false)} />}
      </div>
    </div>
  )
}

export default IndexPopup