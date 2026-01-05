import { useReadContract, usePublicClient } from "wagmi";
import { erc20Abi } from "viem";
import poolManagerABI from "@/abi/PoolManager.json";

export function usePoolManager() {
  const publicClient = usePublicClient();

  const {
    data: rawPools,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: process.env.NEXT_PUBLIC_POOL_MANAGER_ADDRESS as `0x${string}`,
    abi: poolManagerABI.abi,
    functionName: "getAllPools",
  });

  const getTokenSymbol = async (tokenAddress: `0x${string}`) => {
    if (!publicClient) return "UNKNOWN";
    console.log("tokenAddress===", tokenAddress, publicClient)
    try {
      return await publicClient.readContract({
        address: tokenAddress,
        abi: erc20Abi,
        functionName: "symbol",
      });
    } catch (error) {
      // console.error(`Failed to fetch symbol for token ${tokenAddress}:`, error);
      console.log("error")
      return "UNKNOWN";
    }
  };

  return { rawPools, isLoading, error, refetch, getTokenSymbol };
}

