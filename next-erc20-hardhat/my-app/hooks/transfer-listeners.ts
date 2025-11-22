'use client';

import { useWatchContractEvent } from 'wagmi'
import { isAddress } from 'viem'
import { useTransferLogsStore } from '@/stores/transfer-logs'
import MyTokenABI from "../abi/MyToken.json";
import { TransferLog } from '../types'

export default function useTransferListeners(contractAddress: `0x${string}`) {

  const addLog = useTransferLogsStore((state) => state.addLog)

  useWatchContractEvent({
    address: isAddress(contractAddress) ? contractAddress : undefined, 
    abi: MyTokenABI.abi,
    eventName: 'Transfer',
    onLogs: (logs) => {
      logs.forEach((log) => {
        console.log("useWatchContractEvent log:", log)
        addLog(log as TransferLog)
      })
    },
    onError: (error) => {
      console.error('监听失败:', error)
    }
  })

  return null
}