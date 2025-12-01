// import { useState } from 'react'
import WalletConnectKitProvider from './provider/WalletConnectKitProvider'
import './App.css'

function App() {
  // const [count, setCount] = useState(0)

  return (
    <>
      <WalletConnectKitProvider>
        <div className='text-2xl font-bold text-red-500'>这是一个钱包页面吗？</div>
      </WalletConnectKitProvider>
    </>
  )
}

export default App
