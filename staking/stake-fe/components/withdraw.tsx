/*
 * @Author: zhangjian
 * @Date: 2025-11-28 10:46:15
 * @LastEditTime: 2025-11-28 17:41:13
 * @LastEditors: zhangjian
 * @Description: 质押组件
 */
import { useState, useEffect } from "react";
import { useConnection, useWriteContract, useWaitForTransactionReceipt, useReadContract, useReadContracts, useBlockNumber } from "wagmi";
import { formatUnits, formatEther, parseEther } from "viem";
import stakingAbi from "@/abi/StakeToken.json";
import { Label } from "@/components/ui/label"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
import CustomConnectButton from '@/components/custome-connect-button';
import { useToast } from "@/hooks/use-toast";

export default function Stake() {
  const stakingAddress = process.env.NEXT_PUBLIC_STAKING_CONTRACT_ADDRESS as `0x${string}`;
  const { toast } = useToast();
   const { data: blockNumber } = useBlockNumber({ watch: true });
  const { isConnected, address: currentUserAddress } = useConnection();
  const { data:hash, writeContract, isPending, error: submitError} = useWriteContract();
  const { status: txStatus, isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({ hash })

  const wagmigotchiContract = {
    address: stakingAddress,
    abi: stakingAbi.abi,
  } as const
  
  const { data: userStakingBalance, isLoading } = useReadContracts({
      contracts: [
        {
          ...wagmigotchiContract,
          functionName: "stakingBalance",
          args: [0, currentUserAddress],
        },
        {
          ...wagmigotchiContract,
          functionName: 'withdrawAmount',
          args: [0, currentUserAddress],
        },
        {
          ...wagmigotchiContract,
          functionName: "user",
          args: [0, currentUserAddress],  
        }
      ],
    }
  );

  console.log("userStakingBalance===", userStakingBalance, userStakingBalance?.[2]?.result?.toString(), blockNumber)

  const balanceByType = [{
    type: "ETH",
    balance: formatEther(userStakingBalance?.[0]?.result?.toString() || "0"),
    title: "Staked Amount"
  }, {
    type: "ETH",
    balance: formatEther(userStakingBalance?.[1]?.result?.[1]?.toString() || "0"),
    title: "Available to Withdraw"
  }, {
    type: "ETH",
    balance: formatEther(userStakingBalance?.[1]?.result?.[0]?.toString() || "0"),
    title: "Pending Withdraw"
  }]

  const [inputUnstakeAmount, setInputUnstakeAmount] = useState("");

  const onClickUnstakeButton = () => {
    if (!isConnected || !currentUserAddress) {
      toast({
        title: "Error",
        description: "Please connect your wallet first",
        variant: "error",
      });
      return;
    }
    writeContract({
      ...wagmigotchiContract,
      functionName: 'unstake',
      args: [0, parseEther(inputUnstakeAmount)],
    })
  }

  // 根据状态更新UI
  useEffect(() => {
    if (txStatus === 'success') {
      toast({
        variant: "success",
        title: "success",
        description: "解质押成功！",
      });
    }
  }, [txStatus]);

  return (
    <div className="w-full p-8 pt-6">
      <div className="text-stone-400 text-3xl text-center">Withdraw ETH</div>
      <div className="text-stone-500 text-xl text-center pt-2">Unstake and withdraw your ETH</div>
      <div className="grid gap-4 grid-cols-3 pt-4">
        {
          balanceByType.map(item => {
            return (
              <div key={item.title} className="bg-white rounded-lg flex flex-col items-center gap-2 p-2">
                <h6 className="text-stone-900 text-sm">{item.title}</h6>
                <p className="text-stone-600 text-sm font-bold">{item.balance} {item.type}</p>
              </div>
            )
          })
        }
      </div>
      <div className="font-semibold text-2xl text-white mt-8">Unstake</div>
      <div className=" text-white w-full border border-stone-500 rounded-md  my-2 p-4">
        <Label htmlFor="amount" className="py-2">Amount to Stake</Label>
        <InputGroup className="mb-4">
          <InputGroupInput  id="amount" placeholder="0.00" value={inputUnstakeAmount} onChange={(e) => setInputUnstakeAmount(e.target.value.trim())} />
          <InputGroupAddon align="inline-end">
            <InputGroupText className="text-white">ETH</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        <div className="flex justify-center">
          {isConnected ? 
            <Button variant="outline" size="lg" className="cursor-pointer text-stone-950 bg-stone-400" disabled={isPending || isConfirming}  onClick={onClickUnstakeButton}>
              {isPending ? '等待钱包确认...' : isConfirming ? '交易确认中...' : 'Unstake'}
            </Button> : 
            <CustomConnectButton />}
        </div>
      </div>
      <div className="font-semibold text-2xl text-white mt-6">Withdraw</div>
      <div className="flex justify-between items-center bg-white rounded-lg p-4 mt-2">
        <div>
          <p className="text-sm text-stone-700">Ready to Withdraw</p>
          <div className="text-2xl font-bold text-stone-500">{formatEther(userStakingBalance?.[1]?.result?.[1]?.toString() || "0")} ETH</div>
        </div>
        <div className="text-sm text-stone-400">20 min cooldown</div>
      </div>
     <div className="flex justify-center mt-4">
       <Button variant="outline" size="lg" className="cursor-pointer text-stone-950 bg-stone-400">Withdraw ETH</Button>
     </div>
    </div>
  )
}