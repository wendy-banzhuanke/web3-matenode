import { useWallet } from "../hooks/useWallet"
import { formatWeiToEth } from "../utils"

export function AccountModal({onClose}: {onClose: () => void}) {
    const {account, amount, symbol, disconnectWallet} = useWallet()

    return (
        <div className="fixed inset-0 bg-black/30">
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] w-[300px] flex flex-col items-center justify-center gap-4">
                <button className="close-button absolute top-4 right-4 text-2xl" onClick={onClose}>
                    ×
                </button>
                <div className='mt-16'>
                    <p className='text-lg font-bold text-center'>{account?.slice(0, 6) + '...' + account?.slice(-4)}</p>
                    <p className='text-gray-600 text-center mt-2'>{amount? `${formatWeiToEth(amount)} ${symbol}` : '0'} {symbol}</p>
                </div>
                <div className='mt-8 flex items-center justify-between flex-auto'>
                    <button className="mr-4" onClick={() => {
                        navigator.clipboard.writeText(account || '')
                    }}>复制地址</button>
                    <button onClick={() => disconnectWallet()}>Disconnect</button>
                </div>
            </div>
        </div>
    )
}