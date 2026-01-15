import { useEffect } from "react"
import { useWalletStore } from "~sotres/wallet"
// import "~style.css"

function IndexPopup() {

  const { createWallet, wallet } = useWalletStore()
  
  return (
    <div className="plasmo-flex plasmo-items-center plasmo-justify-center plasmo-h-16 plasmo-w-40">
      <button onClick={async () => await createWallet()}>请先链接钱包</button>
      <div>
        {JSON.stringify(wallet)}
      </div>
    </div>
  )
}

export default IndexPopup
