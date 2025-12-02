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
      // MetaMask/Coinbase/OKX的检测方式不同
      switch(wallet.id) {
        case 'metamask':
          return !!window.ethereum?.isMetaMask
        case 'coinbase':
          return !!window.ethereum?.isCoinbaseWallet
        case 'okx':
          return !!window.ethereum?.isOkxWallet
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
    <div className="wallet-modal-overlay">
      <div className="wallet-modal">
        <button className="close-button" onClick={onClose}>
          ×
        </button>

        {/* 已安装的钱包 */}
        {walletGroups.installed.length > 0 && (
          <div className="wallet-group">
            <h4>Installed Wallets</h4>
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
            <h4>Popular Wallets</h4>
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
    <div className="wallet-item" onClick={onClick}>
      <img src={wallet.icon} alt={wallet.name} width={32} />
      <span>{wallet.name}</span>
      {isInstallable && <span className="install-badge">Install</span>}
    </div>
  )
}
