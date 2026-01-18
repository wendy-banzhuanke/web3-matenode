import { useEffect } from "react"
import { useWalletStore } from "~stores/wallet"
import BalanceShow from "./BalanceShow"
import ClearWalletButton from "./ClearWalletButton"

function Dashboard() {

  const { wallet } = useWalletStore()
  const handleCopy = () => {
    navigator.clipboard.writeText(wallet.address)
    console.log("钱包地址已复制")
  }
  
  return (
    // plasmo-flex plasmo-items-center plasmo-justify-center 
    <div className="plasmo-h-[600px] plasmo-w-[380px]">
      <div>
         <ClearWalletButton />
      </div>

      <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-my-4 plasmo-text-2xl">
        <h3 className="plasmo-text-xl">钱包地址：</h3>
        <p className="plasmo-text-xl">{`${wallet.address.slice(0, 6)}...${wallet.address.slice(-4)}`}</p>
        <div className="plasmo-text-xl" onClick={handleCopy}>复制</div>
      </div>

      <div>
        <BalanceShow />
      </div>
    </div>
  )
}

export default Dashboard
