import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { WalletModal } from './WalletModal'
import { AccountModal } from './AccountModal'
import { formatWeiToEth } from '../utils/index'

export function ConnectButton() {
    const [showModal, setShowModal] = useState(false)
    const [showAccountModal, setShowAccountModal] = useState(false)
    const {isConnected, account, amount, symbol, disconnectWallet} = useWallet()

    const handleAccountModal = () => {
        // setShowModal(true)
        // disconnectWallet()
        setShowAccountModal(true)
    }

    return (
        <>
            {
                isConnected ? (
                    <div className='inline-flex items-center'>
                        {/*  shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-lg p-2 font-bold text-gray-900 mr-4 */}
                        <div className='flex items-center justify-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-lg px-2 py-1 font-bold text-gray-900 mr-4'>
                            <div className='w-8 h-8 rounded-full bg-[#2ECC71] mr-2'></div>
                            <div className='text-lg font-bold'>Sepolia</div>
                            <div className='w-4 h-4 rounded-full bg-[#2ECC71] ml-2'></div>
                        </div>
                        <div className='inline-flex items-center shadow-[0_4px_12px_rgba(0,0,0,0.1)] rounded-lg px-2 py-1 bg-white font-bold text-gray-900' onClick={handleAccountModal}>
                            <div className='mr-2'>{amount? formatWeiToEth(amount) : '0'} {symbol}</div>
                            <div className='rounded-lg px-2 py-1 flex items-center bg-gray-100'>
                                <div className='w-8 h-8 rounded-full bg-[#F0932B] flex items-center justify-center mr-2'></div>
                                <p>{`${account?.slice(0, 6)}...${account?.slice(-4)}`}</p>
                                <div className='w-2 h-2 rounded-full bg-[#2ECC71]'></div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <button onClick={
                        () => isConnected ? disconnectWallet() : setShowModal(true)}>
                        {
                            isConnected ? 
                            `${account?.slice(0, 6)}...${account?.slice(-4)}` : 
                            'Connect Wallet'
                        }
                    </button>
                )
            }

            {
                showModal && (
                    <WalletModal onClose={() => setShowModal(false)}></WalletModal>
                )
            }
            {
                showAccountModal && (
                    <AccountModal onClose={() => setShowAccountModal(false)}></AccountModal>
                )
            }
        </>
    )
}