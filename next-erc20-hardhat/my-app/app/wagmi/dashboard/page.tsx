import { useConnection, useEnsName } from 'wagmi'

export default function Dashboard() {
    const { address } = useConnection()
    const { data, error, status } = useEnsName({ address })
    if (status === 'pending') return <div>Loading ENS name</div>
    if (status === 'error')
        return <div>Error fetching ENS name: {error.message}</div>
    return <div>ENS name: {data}</div>
//   return (
//     <div>
//       {isConnected ? (
//         <Link href="/dashboard">进入控制面板</Link>
//         ) : (
//         <button onClick={connectWallet}>连接钱包</button>
//         )}
//     </div>
//   )
}