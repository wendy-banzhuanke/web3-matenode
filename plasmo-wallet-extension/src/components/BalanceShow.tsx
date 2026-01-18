import { useEffect } from "react"
import { useWalletStore } from "~stores/wallet"

export default function BalanceShow() {
  const { ethBalance, tokenBalances, loadingBalances,fetchBalances } = useWalletStore()
  
  // 组件加载时自动获取余额
  useEffect(() => {
    fetchBalances()
  }, [])
  
  return (
    <div className="plasmo-p-4 plasmo-bg-gray-100 plasmo-rounded-lg plasmo-mb-4">
      <h3 className="plasmo-text-lg plasmo-font-bold plasmo-mb-2">资产余额</h3>
      
      {loadingBalances ? (
        <p>加载中...</p>
      ) : (
        <>
          <div className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-2">
            <span>ETH</span>
            <span className="plasmo-font-mono">
              {parseFloat(ethBalance).toFixed(4)}
            </span>
          </div>
          
          {tokenBalances.map((token) => (
            <div 
              key={token.contractAddress}
              className="plasmo-flex plasmo-items-center plasmo-justify-between plasmo-mb-2"
            >
              <span>{token.symbol}</span>
              <span className="plasmo-font-mono">
                {parseFloat(token.balance).toFixed(2)}
              </span>
            </div>
          ))}
          
          <button
            onClick={fetchBalances}
            className="plasmo-mt-2 plasmo-text-sm plasmo-text-blue-500 hover:plasmo-text-blue-700"
          >
            刷新余额
          </button>
        </>
      )}
    </div>
  )
}
