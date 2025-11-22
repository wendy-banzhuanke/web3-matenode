import { create } from 'zustand'
import { TransferLogsState, TransferLog } from '../types'

export const useTransferLogsStore = create<TransferLogsState>((set) => ({
  logs: [],
  addLog: (log: TransferLog) => set((state) => ({
    logs: [...state.logs.slice(-999), log] // 限制最大1000条
  })),
  clearLogs: () => set({ logs: [] })
}))
