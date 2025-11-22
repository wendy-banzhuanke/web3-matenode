import { Log } from 'viem'

export type TransferLog = Log & {
  args: {
    from: string
    to: string
    value: bigint
  }
}

export interface TransferLogsState {
  logs: TransferLog[]
  addLog: (log: TransferLog) => void
  clearLogs: () => void
}