/*
 * @Author: zhangjian
 * @Date: 2025-11-28 10:46:15
 * @LastEditTime: 2025-11-28 17:14:20
 * @LastEditors: zhangjian
 * @Description: 质押组件
 */

import { useConnection, useBalance, useChainId } from "wagmi";
import { type UseBalanceReturnType } from 'wagmi'
import { formatUnits } from 'viem';
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import CustomConnectButton from '@/components/custome-connect-button';

export default function Stake() {
    const chainId = useChainId();
    const { isConnected, address } = useConnection();
    const result:UseBalanceReturnType = useBalance({ address, chainId })

  return (
    <div className="w-full p-8">
      <div className="text-stone-400 text-3xl text-center">Stake ETH to earn tokens</div>
      <div className="border-1 border-stone-500 rounded-md p-8 mt-8 flex flex-col items-center gap-4">
        <div className=" text-white w-full border border-stone-500 rounded-md my-2 p-4">
          Staked Amount 0.0000 ETH
        </div>
        <div className=" text-white w-full border border-stone-500 rounded-md  my-2 p-4">
          <Label htmlFor="amount" className="py-2">Amount to Stake</Label>
          <InputGroup>
            <InputGroupInput  id="amount" placeholder="0.00" />
            <InputGroupAddon align="inline-end">
              <InputGroupText className="text-white">ETH</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          {result.data ? (
            <p className="text-stone-400 text-sm py-2">
              Balance: {Number(formatUnits(result.data.value, result.data.decimals)).toFixed(4)} {result.data.symbol}
            </p>
          ) : result.isLoading ? (
            <p className="text-stone-400 text-sm py-2">Loading balance...</p>
          ) : null}
        </div>
        <div>
          {isConnected ? 
            <Button variant="outline" size="lg" className="cursor-pointer">Stake ETH</Button> : 
            <CustomConnectButton />}
        </div>
      </div>
    </div>
  )
}