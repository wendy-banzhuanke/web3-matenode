import { useEffect, useState } from "react"
import { useWalletStore } from "~stores/wallet"
import BalanceShow from "./BalanceShow"
import ClearWalletButton from "./ClearWalletButton"
import SendComponent from "./SendComponent"

function Dashboard() {

  const { wallet, resetTransferStatus } = useWalletStore()
  const [showSendComponent, setShowSendComponent] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address)
    console.log("钱包地址已复制")
  }

  const handleResetTransferStatus = () => {
    resetTransferStatus()
  }
  
  return (
    // plasmo-flex plasmo-items-center plasmo-justify-center 
    <div className="plasmo-h-[600px] plasmo-w-[380px]">
      <div>
         <ClearWalletButton />
         <button className="plasmo-m-2" onClick={handleResetTransferStatus}>重置交易状态</button>
      </div>

      <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-my-4 plasmo-text-2xl">
        <h3 className="plasmo-text-xl">钱包地址：</h3>
        <p className="plasmo-text-xl">{`${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}</p>
        <div className="plasmo-text-xl" onClick={handleCopy}>复制</div>
      </div>

      <div>
        <BalanceShow />
      </div>

      <div className="plasmo-mt-4">
        <div className="plasmo-p-4 plasmo-text-center">
          <button
            onClick={() => setShowSendComponent(true)}
            className="plasmo-px-6 plasmo-py-2 plasmo-bg-green-500 plasmo-text-white plasmo-rounded-lg hover:plasmo-bg-green-600"
          >
            发送
          </button>
        </div>
        
        {showSendComponent && (
          <SendComponent onClose={() => setShowSendComponent(false)} />
        )}
      </div>
    </div>
  )
}

export default Dashboard
