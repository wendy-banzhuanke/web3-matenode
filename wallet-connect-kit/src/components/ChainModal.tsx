// import { useWallet } from "../hooks/useWallet"

export function ChainModal({onClose}: {onClose: () => void}) {
    // const { chainId } = useWallet()

    return (
        <div className="fixed inset-0 bg-black/30 ">
            <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] w-[300px] flex flex-col items-center justify-center gap-4">
                <button className="close-button absolute top-4 right-4 text-2xl" onClick={onClose}>
                    ×
                </button>
                <div className="mt-16 w-full font-bold">
                    <div className="border-b py-2 px-4 border-gray-300 flex items-center cursor-pointer">
                        <p>localhost</p>
                        <div className="w-2 h-2 bg-green-500 rounded-lg  ml-4"></div>
                    </div>
                    <div className="border-b py-2 px-4 border-gray-300 flex items-center cursor-pointer">
                        <p>sepolia</p>
                        <div className="w-2 h-2 bg-green-500 rounded-lg ml-4"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}