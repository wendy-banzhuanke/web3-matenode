import { useState } from "react"
import { useWalletStore } from "~stores/wallet"
import { isAddress } from "ethers"

type TokenType = "ETH" | "ERC20" | "ERC721"

export default function SendComponent({ onClose }: { onClose: () => void }) {
  const {
    ethBalance,
    transferETH,
    transferERC20,
    transferERC721,
    transferStatus,
    activeNetworkKey,
    activeChainId,
    getExplorerTxUrl,
    receiptCheck,
    checkPendingTransaction,
    speedUpTransaction,
    cancelTransaction
  } = useWalletStore()

  const [tokenType, setTokenType] = useState<TokenType>("ETH")
  const [toAddress, setToAddress] = useState("")
  const [amount, setAmount] = useState("")
  const [tokenAddress, setTokenAddress] = useState("")
  const [tokenId, setTokenId] = useState("")
  const [pendingTxInfo, setPendingTxInfo] = useState<any>(null)

  const txUrl = transferStatus.txHash ? getExplorerTxUrl(transferStatus.txHash) : null
  
  const handleSubmit = async () => {
    if (!toAddress || !isAddress(toAddress)) {
      alert(`请输入有效的收款地址: ${toAddress}`)
      return
    }
    
    try {
      if (tokenType === "ETH") {
        if (!amount || parseFloat(amount) <= 0) {
          alert("请输入有效的转账金额")
          return
        }
        await transferETH(toAddress, amount)
      } else if (tokenType === "ERC20") {
        if (!tokenAddress || !isAddress(tokenAddress)) {
          alert("请输入有效的代币合约地址")
          return
        }
        if (!amount || parseFloat(amount) <= 0) {
          alert("请输入有效的转账金额")
          return
        }
        await transferERC20(tokenAddress, toAddress, amount)
      } else if (tokenType === "ERC721") {
        if (!tokenAddress || !isAddress(tokenAddress)) {
          alert("请输入有效的NFT合约地址")
          return
        }
        if (!tokenId) {
          alert("请输入有效的Token ID")
          return
        }
        await transferERC721(tokenAddress, toAddress, tokenId)
      }
    } catch (error) {
      console.error("转账失败:", error)
    }
  }

  const handleCheckPending = async () => {
    if (!transferStatus.txHash) {
      alert("没有待检查的交易")
      return
    }

    const info = await checkPendingTransaction(transferStatus.txHash)
    setPendingTxInfo(info)
    console.log("交易详情:", info)
  }

  const handleSpeedUp = async () => {
    if (!transferStatus.txHash) {
      alert("没有可加速的交易")
      return
    }

    if (!confirm("确定要加速这笔交易吗？这将花费更多gas费。")) {
      return
    }

    try {
      await speedUpTransaction(transferStatus.txHash)
      alert("交易加速成功！")
      setPendingTxInfo(null)
    } catch (error) {
      alert("加速失败: " + error.message)
    }
  }

  const handleCancel = async () => {
    if (!transferStatus.txHash) {
      alert("没有可取消的交易")
      return
    }

    if (!confirm("确定要取消这笔交易吗？这将发送一笔0 ETH的交易给自己。")) {
      return
    }

    try {
      await cancelTransaction(transferStatus.txHash)
      alert("交易已取消！")
      setPendingTxInfo(null)
    } catch (error) {
      alert("取消失败: " + error.message)
    }
  }

  return (
    <div className="plasmo-fixed plasmo-inset-0 plasmo-bg-black plasmo-bg-opacity-50 plasmo-flex plasmo-items-center plasmo-justify-center plasmo-z-50">
      <div className="plasmo-bg-white plasmo-p-6 plasmo-rounded-lg plasmo-w-96">
        <h2 className="plasmo-text-xl plasmo-font-bold plasmo-mb-4">发送资产</h2>
        <div className="plasmo-mb-4 plasmo-text-xs plasmo-text-gray-500">
          当前网络: {activeNetworkKey} (chainId: {activeChainId})
        </div>
        
        {transferStatus.loading && (
          <div className="plasmo-mb-4 plasmo-text-blue-500">
            正在发送交易...
          </div>
        )}
        {transferStatus.pending && (
          <div className="plasmo-mb-4 plasmo-text-yellow-600">
            交易已发送到网络，等待区块确认...
            {txUrl && (
              <a
                href={txUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="plasmo-ml-2 plasmo-text-blue-500 plasmo-underline"
              >
                查看交易
              </a>
            )}
          </div>
        )}
        {transferStatus.error && (
          <div className="plasmo-mb-4 plasmo-text-red-500">
            {transferStatus.error}
            {transferStatus.pending && txUrl && (
              <a
                href={txUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="plasmo-ml-2 plasmo-text-blue-500 plasmo-underline"
              >
                查看交易状态
              </a>
            )}
          </div>
        )}
        {transferStatus.success && (
          <div className="plasmo-mb-4 plasmo-text-green-500">
            ✅ 交易已确认!
            {txUrl && (
              <a
                href={txUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="plasmo-ml-2 plasmo-text-blue-500 plasmo-underline"
              >
                查看交易详情
              </a>
            )}
          </div>
        )}
        
        <div className="plasmo-mb-4">
          <label className="plasmo-block plasmo-text-sm plasmo-font-medium plasmo-text-gray-700 plasmo-mb-1">
            资产类型
          </label>
          <select
            value={tokenType}
            onChange={(e) => setTokenType(e.target.value as TokenType)}
            className="plasmo-w-full plasmo-p-2 plasmo-border plasmo-rounded"
          >
            <option value="ETH">ETH</option>
            <option value="ERC20">ERC20 代币</option>
            <option value="ERC721">ERC721 NFT</option>
          </select>
        </div>
        
        <div className="plasmo-mb-4">
          <label className="plasmo-block plasmo-text-sm plasmo-font-medium plasmo-text-gray-700 plasmo-mb-1">
            收款地址
          </label>
          <input
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="0x..."
            className="plasmo-w-full plasmo-p-2 plasmo-border plasmo-rounded"
          />
        </div>
        
        {(tokenType === "ETH" || tokenType === "ERC20") && (
          <div className="plasmo-mb-4">
            <label className="plasmo-block plasmo-text-sm plasmo-font-medium plasmo-text-gray-700 plasmo-mb-1">
              金额
            </label>
            <div className="plasmo-flex">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.0"
                className="plasmo-flex-1 plasmo-p-2 plasmo-border plasmo-rounded-l"
              />
              <span className="plasmo-bg-gray-100 plasmo-p-2 plasmo-border-t plasmo-border-b plasmo-border-r plasmo-rounded-r">
                {tokenType === "ETH" ? "ETH" : "代币"}
              </span>
            </div>
            {tokenType === "ETH" && (
              <p className="plasmo-text-xs plasmo-text-gray-500 plasmo-mt-1">
                可用余额: {parseFloat(ethBalance).toFixed(6)} ETH
              </p>
            )}
          </div>
        )}
        
        {(tokenType === "ERC20" || tokenType === "ERC721") && (
          <div className="plasmo-mb-4">
            <label className="plasmo-block plasmo-text-sm plasmo-font-medium plasmo-text-gray-700 plasmo-mb-1">
              {tokenType === "ERC20" ? "代币合约地址" : "NFT合约地址"}
            </label>
            <input
              type="text"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              className="plasmo-w-full plasmo-p-2 plasmo-border plasmo-rounded"
            />
          </div>
        )}
        
        {tokenType === "ERC721" && (
          <div className="plasmo-mb-4">
            <label className="plasmo-block plasmo-text-sm plasmo-font-medium plasmo-text-gray-700 plasmo-mb-1">
              Token ID
            </label>
            <input
              type="text"
              value={tokenId}
              onChange={(e) => setTokenId(e.target.value)}
              placeholder="123"
              className="plasmo-w-full plasmo-p-2 plasmo-border plasmo-rounded"
            />
          </div>
        )}
        
        <div className="plasmo-flex plasmo-justify-end plasmo-space-x-2 plasmo-mt-4">
          <button
            onClick={onClose}
            className="plasmo-px-4 plasmo-py-2 plasmo-bg-gray-200 plasmo-rounded hover:plasmo-bg-gray-300"
          >
            取消
          </button>
          <button
            onClick={handleSubmit}
            disabled={transferStatus.loading || transferStatus.pending}
            className="plasmo-px-4 plasmo-py-2 plasmo-bg-blue-500 plasmo-text-white plasmo-rounded hover:plasmo-bg-blue-600 disabled:plasmo-opacity-50"
          >
            {transferStatus.loading ? "发送中..." : transferStatus.pending ? "确认中..." : "发送"}
          </button>
        </div>

        {transferStatus.pending && transferStatus.txHash && (
          <div className="plasmo-mt-4 plasmo-p-4 plasmo-border plasmo-border-yellow-300 plasmo-rounded plasmo-bg-yellow-50">
            <h3 className="plasmo-font-semibold plasmo-mb-2 plasmo-text-sm">交易管理</h3>
            <div className="plasmo-flex plasmo-gap-2">
              <button
                onClick={handleCheckPending}
                className="plasmo-px-3 plasmo-py-1 plasmo-text-sm plasmo-bg-blue-500 plasmo-text-white plasmo-rounded hover:plasmo-bg-blue-600"
              >
                检查详情
              </button>
              <button
                onClick={handleSpeedUp}
                className="plasmo-px-3 plasmo-py-1 plasmo-text-sm plasmo-bg-orange-500 plasmo-text-white plasmo-rounded hover:plasmo-bg-orange-600"
              >
                加速交易
              </button>
              <button
                onClick={handleCancel}
                className="plasmo-px-3 plasmo-py-1 plasmo-text-sm plasmo-bg-red-500 plasmo-text-white plasmo-rounded hover:plasmo-bg-red-600"
              >
                取消交易
              </button>
            </div>

            {pendingTxInfo && (
              <div className="plasmo-mt-3 plasmo-text-xs plasmo-text-gray-700">
                <p><strong>状态:</strong> {pendingTxInfo.status}</p>
                <p><strong>消息:</strong> {pendingTxInfo.message}</p>
                {pendingTxInfo.nonce !== undefined && (
                  <p><strong>Nonce:</strong> {pendingTxInfo.nonce}</p>
                )}
                {pendingTxInfo.maxFeePerGas && (
                  <p><strong>Max Fee:</strong> {(BigInt(pendingTxInfo.maxFeePerGas) / 1000000000n).toString()} Gwei</p>
                )}
                {pendingTxInfo.maxPriorityFeePerGas && (
                  <p><strong>Priority Fee:</strong> {(BigInt(pendingTxInfo.maxPriorityFeePerGas) / 1000000000n).toString()} Gwei</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
