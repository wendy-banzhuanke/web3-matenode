/*
 * @Author: zhangjian
 * @Date: 2025-11-28 10:46:15
 * @LastEditTime: 2025-11-30 12:14:20
 * @LastEditors: zhangjian
 * @Description: 质押组件
 */

import { useState } from "react";
import { useConnection, useBalance, useChainId, useWriteContract, useWaitForTransactionReceipt, useReadContract } from "wagmi";
import { type UseBalanceReturnType } from 'wagmi'
import { formatUnits, formatEther, parseEther } from "viem";

import stakingAbi from '@/abi/StakeToken.json';
import { Label } from "@/components/ui/label"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import CustomConnectButton from '@/components/custome-connect-button';
import { useToast } from "@/hooks/use-toast";
import { useWriteTransaction } from "@/hooks/use-write-transaction";

export default function Stake() {
  const stakingAddress = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS as `0x${string}`;
  const { toast } = useToast();
  const chainId = useChainId();
  const { isConnected, address: currentUserAddress } = useConnection();
  const result:UseBalanceReturnType = useBalance({ address: currentUserAddress, chainId })
  const { data: poolData } = useReadContract({
    abi: stakingAbi.abi,
    address: stakingAddress,
    functionName: 'pool', // 读取pool结构体
    args: [0],       // 池ID
  })
 
  const [inputStakeAmount, setInputStakeAmount] = useState("");

  const stake = useWriteTransaction({name: '质押 ETH'});

  const onClickStakeButton = async () => {
    if (!stakingAddress) {
      toast({
        variant: "error",
        title: "error",
        description: "请连接钱包",
      });

      return;
    };

    if (!result.data || result.data.value === BigInt(0)) {
      toast({
        variant: "error",
        title: "error",
        description: "账户暂无可用余额 ETH",
      });
      return;
    };

    if(!inputStakeAmount || BigInt(inputStakeAmount) <= 0) {
      toast({
        variant: "error",
        title: "error",
        description: "请输入质押 ETH",
      });
      return;
    }

    const amountInWei = parseEther(inputStakeAmount);
    stake.writeContract({
      abi: stakingAbi.abi,
      address: stakingAddress,
      functionName: 'depositETH',
      value: amountInWei,
    });
  }

  return (
    <div className="w-full p-8">
      <div className="text-stone-400 text-3xl text-center">Stake ETH to earn tokens</div>
      <div className="border-1 border-stone-500 rounded-md p-8 mt-8 flex flex-col items-center gap-4">
        <div className=" text-white w-full border border-stone-500 rounded-md my-2 p-4">
          Staked Amount {poolData && Array.isArray(poolData) && poolData[4] ? formatEther(poolData[4] as bigint) : '0'} ETH
        </div>
        <div className=" text-white w-full border border-stone-500 rounded-md  my-2 p-4">
          <Label htmlFor="amount" className="py-2">Amount to Stake</Label>
          <InputGroup>
            <InputGroupInput id="amount" placeholder="0.000" value={inputStakeAmount} onChange={(e) => setInputStakeAmount(e.target.value.trim())} />
            <InputGroupAddon align="inline-end">
              <InputGroupText className="text-white">ETH</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          {result.data ? (
            <p className="text-stone-400 text-sm py-2">
              Available: {Number(formatUnits(result.data.value, result.data.decimals)).toFixed(4)} {result.data.symbol}
            </p>
          ) : result.isLoading ? (
            <p className="text-stone-400 text-sm py-2">Loading balance...</p>
          ) : null}
        </div>
        <div>
          {isConnected ? 
            <Button variant="outline" size="lg" className="cursor-pointer" onClick={onClickStakeButton} disabled={stake.isPending || stake.isConfirming}>
              {stake.isPending ? '等待钱包确认...' : stake.isConfirming ? '交易确认中...' : 'Stake ETH'}
            </Button> : 
            <CustomConnectButton />}
        </div>
      </div>
    </div>
  )
}