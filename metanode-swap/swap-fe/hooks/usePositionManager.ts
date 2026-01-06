import { useReadContract, useConnection } from "wagmi";
import positionManagerABI from "@/abi/PositionManager.json";
import { useMemo } from "react";

export interface PositionInfo {
  id: bigint;
  owner: string;
  token0: string;
  token1: string;
  index: number;
  fee: number;
  liquidity: bigint;
  tickLower: number;
  tickUpper: number;
  tokensOwed0: bigint;
  tokensOwed1: bigint;
  feeGrowthInside0LastX128: bigint;
  feeGrowthInside1LastX128: bigint;
}

export function usePositionManager() {
  const { address } = useConnection();

  const {
    data: rawPositions,
    isLoading,
    error,
    refetch,
  } = useReadContract({
    address: process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS as `0x${string}`,
    abi: positionManagerABI.abi,
    functionName: "getAllPositions",
  });

  console.log("rawPositions====", address)
//   const positions = rawPositions

  const positions = useMemo(() => {
    if (!rawPositions || !address) return [];
    // The ABI return type for getAllPositions is an array of structs
    return (rawPositions as PositionInfo[]).filter(
      (pos) => pos.owner.toLowerCase() === address.toLowerCase()
    );
  }, [rawPositions, address]);

   console.log("rawPositions====", rawPositions)

  return { positions, isLoading, error, refetch };
}
