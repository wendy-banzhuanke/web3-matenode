'use client';
import { useConnection, useEnsName } from 'wagmi'

export default function Page() {
  const { address } = useConnection()
  const { data, error, status } = useEnsName({ address })
  if (status === 'pending') return <div>Loading ENS name</div>
  if (status === 'error')
    return <div>Error fetching ENS name: {error.message}</div>
  return <div>ENS name: {data}{address}</div>
}
