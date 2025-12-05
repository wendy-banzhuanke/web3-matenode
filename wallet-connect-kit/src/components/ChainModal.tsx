/*
 * @Author: zhangjian
 * @Date: 2025-12-05 09:04:33
 * @LastEditTime: 2025-12-05 10:48:30
 * @LastEditors: zhangjian
 * @Description: 描述
 */
import { useChains } from "../hooks/useChains";
import { useWallet } from "../hooks/useWallet";

export function ChainModal({ onClose }: { onClose: () => void }) {
  const { chainId } = useWallet();
  const { switchChain, supportedChains } = useChains();

  return (
    <div className="fixed inset-0 bg-black/30 ">
      <div className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] w-[300px] flex flex-col items-center justify-center gap-4">
        <button
          className="close-button absolute top-4 right-4 text-2xl"
          onClick={onClose}
        >
          ×
        </button>
        <div className="mt-16 w-full font-bold">
          {Object.entries(supportedChains).map(([key, chain]) => (
            // <div key={key} className="border-b py-3 px-4 border-gray-300 flex items-center justify-between cursor-pointer" onClick={() => switchChain(chain.id)}>
            //     <p className='hover:text-green-500'>{chain.name}</p>
            //     <div className={Number(BigInt(chainId)) == Number(BigInt(chain.id)) ? 'w-2 h-2 bg-green-500 rounded-lg ' : 'w-2 h-2 bg-gray-300 rounded-lg'}></div>
            // </div>
            <div
              key={key}
              onClick={() => switchChain(chain.id)}
              className={`py-3 px-4 flex items-center justify-between 
                        ${
                            chainId === chain.id
                                ? "bg-blue-50 text-blue-600"
                                : "hover:bg-gray-50 cursor-pointer"
                        }`}>
              <p>{chain.name}</p>
              {chainId === chain.id && (<span className="text-green-500">✓ 当前链</span>)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
