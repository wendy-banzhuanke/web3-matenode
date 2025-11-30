/*
 * @Author: zhangjian
 * @Date: 2025-11-30 13:53:03
 * @LastEditTime: 2025-11-30 14:01:04
 * @LastEditors: zhangjian
 * @Description: 写合约的状态
 */
import { useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { useToast } from "@/hooks/use-toast";
export function useWriteTransaction({ name }: { name: string }) {
  const { toast } = useToast();
  const { 
    data:hash, 
    writeContract, 
    isPending, 
    error: submitError
  } = useWriteContract();
  const { 
    status: txStatus, 
    isLoading: isConfirming, 
    isSuccess: isConfirmed, 
    error: confirmError 
  } = useWaitForTransactionReceipt({ hash })

  useEffect(() => {
    if (txStatus === 'success') {
      toast({
        variant: "success",
        title: "success",
        description: `${name} 成功！`,
      });
    }
  }, [txStatus]);

  useEffect(() => {
    if (submitError?.message) {
      toast({
        variant: "error",
        title: "error",
        description: submitError?.message,
      });
    }
  }, [submitError?.message]);

  return {
    writeContract,
    isPending,
    submitError,
    txStatus,
    isConfirming,
    isConfirmed,
    confirmError,
    transaction: {
      hash,
      name,
    }
  };
}