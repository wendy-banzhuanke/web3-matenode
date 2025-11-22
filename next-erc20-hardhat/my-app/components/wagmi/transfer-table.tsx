'use client';

import { formatEther } from "viem";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { useTransferLogsStore } from '@/stores/transfer-logs'

export default function TransferList() {
    const logs = useTransferLogsStore((state) => state.logs)

  return (
    <Table>
      <TableCaption>Transfer Logs</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">TransactionHash</TableHead>
          <TableHead>From</TableHead>
          <TableHead>To</TableHead>
          <TableHead className="text-right">Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.transactionHash}>
            <TableCell className="font-medium w-[200px] ">{log.transactionHash}</TableCell>
            <TableCell className="font-medium w-[200px] ">{log?.args?.from}</TableCell>
            <TableCell className="font-medium w-[200px] ">{log?.args?.to}</TableCell>
            <TableCell className="text-right font-medium w-[200px] ">{log?.args?.value ? formatEther(log?.args?.value) : "0"}</TableCell>  
          </TableRow>
        ))}
      </TableBody>
      <TableFooter>
        <TableRow>
          <TableCell colSpan={3} className="font-medium w-[200px] ">Total</TableCell>
          <TableCell className="text-right font-medium w-[200px] ">
            {logs.length}
          </TableCell>
        </TableRow>
      </TableFooter>
    </Table>
  )
}