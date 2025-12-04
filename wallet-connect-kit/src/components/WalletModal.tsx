import { useEffect, useState } from 'react'
import { SUPPORTED_WALLETS } from '../constants/wallets'
import { useWallet } from '../hooks/useWallet'

interface WalletGroup {
  installed: Wallet[]
  popular: Wallet[]
}

type Wallet = typeof SUPPORTED_WALLETS[keyof typeof SUPPORTED_WALLETS]

export function WalletModal({ onClose }: { onClose: () => void }) {
  const { connectWallet } = useWallet()
  const [walletGroups, setWalletGroups] = useState<WalletGroup>({
    installed: [],
    popular: []
  })


  // 检测已安装的钱包
  useEffect(() => {
    const installedWallets = Object.values(SUPPORTED_WALLETS).filter(wallet => {
      switch(wallet.id) {
        case 'metamask':
          return !!window.ethereum?.isMetaMask
        case 'coinbase':
          return !!window.coinbaseWalletExtension?.isCoinbaseWallet
        case 'okx':
          return !!window.okxwallet?.isOkxWallet
        case 'phantom':
          return !!window.ethereum?.isPhantom
        default:
          return false
      }
    })

    // 主流钱包（已安装的除外）
    const popularWallets = Object.values(SUPPORTED_WALLETS).filter(
      wallet => !installedWallets.some(w => w.id === wallet.id)
    )

    setWalletGroups({
      installed: installedWallets,
      popular: popularWallets
    })
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 flex items-center justify-center">
      <div className="bg-black bg-opacity-50 w-[500px] h-[500px] rounded-lg p-8 relative">
        <button className="close-button absolute top-4 right-4 text-2xl" onClick={onClose}>
          ×
        </button>

        {/* 已安装的钱包 */}
        {walletGroups.installed.length > 0 && (
          <div className="text-white">
            <h4 className='text-2xl font-bold mb-4 text-[#46ff65]'>Installed Wallets</h4>
            <div className="wallet-list">
              {walletGroups.installed.map(wallet => (
                <WalletItem 
                  key={wallet.id}
                  wallet={wallet}
                  onClick={() => {
                    connectWallet(wallet.id)
                    onClose()
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* 主流钱包 */}
        {walletGroups.popular.length > 0 && (
          <div className="wallet-group">
            <h4 className='text-2xl font-bold mb-4 text-[#7700f5]'>Popular Wallets</h4>
            <div className="wallet-list">
              {walletGroups.popular.map(wallet => (
                <WalletItem
                  key={wallet.id}
                  wallet={wallet}
                  onClick={() => {
                    window.open(wallet.installLink, '_blank')
                    onClose()
                  }}
                  isInstallable
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// 抽离子组件
function WalletItem({ 
  wallet, 
  onClick,
  isInstallable = false 
}: {
  wallet: Wallet
  onClick: () => void
  isInstallable?: boolean
}) {
  return (
    <div className="flex items-center justify-between p-4 border border-[#1165f5] rounded-md mb-4" onClick={onClick}>
      <img src={wallet.icon} alt={wallet.name} className='w-8 h-8 mr-2' />
      <span className='text-white font-bold text-lg'>{wallet.name}</span>
      {isInstallable && <span className="install-badge">Install</span>}
    </div>
  )
}
