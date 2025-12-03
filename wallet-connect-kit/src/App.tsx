// import { useState } from 'react'
import WalletConnectKitProvider from './provider/WalletConnectProvider'
import { useWallet } from './hooks/useWallet'
import './App.css'
import { ConnectButton } from './components/ConnectButton'

function App() {
  // const [count, setCount] = useState(0)
  return (
    <>
      <WalletConnectKitProvider>
        <WalletDashboard />
      </WalletConnectKitProvider>
    </>
  )
}


function WalletDashboard() {
  const { account, chainId, isConnected, connectWallet, disconnectWallet } = useWallet()

  if(!isConnected){
    return (
      <>
        <ConnectButton />
        {/* <div className='text-2xl font-bold text-red-500' onClick={connectWallet}>请先连接钱包</div> */}
      </>
    )
  }

  return (
    <>
      <div className='text-2xl font-bold text-red-500'>这是一个钱包页面吗？</div>
      <p>当前连接的钱包地址：{account}</p>
      <p>当前连接的链ID：{chainId}</p>
      <button onClick={disconnectWallet}>断开连接</button>
    </>
  )
}
export default App
