import { useState } from 'react'
import { useWallet } from '../hooks/useWallet'
import { WalletModal } from './WalletModal'

export function ConnectButton() {
    const [showModal, setShowModal] = useState(false)
    const {isConnected, account, disconnectWallet} = useWallet()

    return (
        <>
            <button onClick={
                () => isConnected ? disconnectWallet() : setShowModal(true)}>
                {
                    isConnected ? 
                    `${account?.slice(0, 6)}...${account?.slice(-4)}` : 
                    'Connect Wallet'
                }
            </button>

            {
                showModal && (
                    <WalletModal onClose={() => setShowModal(false)}></WalletModal>
                )
            }
        </>
    )
}