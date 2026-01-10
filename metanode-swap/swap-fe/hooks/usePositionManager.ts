import { useReadContract, useConnection, useWriteContract } from "wagmi";
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
  const writeContract = useWriteContract();

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

  // const positions = rawPositions

  const positions = useMemo(() => {
    if (!rawPositions || !address) return [];
    // The ABI return type for getAllPositions is an array of structs
    return (rawPositions as PositionInfo[]).filter(
      (pos) => pos.owner.toLowerCase() === address.toLowerCase()
    );
  }, [rawPositions, address]);

  console.log("rawPositions====", address, rawPositions, positions)

  const burnPosition = (positionId: bigint) => {
    writeContract.mutate({
      address: process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS as `0x${string}`,
      abi: positionManagerABI.abi,
      functionName: "burn",
      args: [positionId],
    }, {
        onSuccess: () => {
            refetch();
        }
    });
  }

  const collectPosition = (positionId: bigint) => {
    console.log("positionId==hooks==", positionId)
    const recipient = address as `0x${string}`;
    writeContract.mutate({
      address: process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS as `0x${string}`,
      abi: positionManagerABI.abi,
      functionName: "collect",
      args: [positionId, recipient]
    }, {
        onSuccess: (data) => {
            console.log("collectPosition==", positionId, data)
            refetch();
        }
    });
  }

  return { positions, isLoading, error, refetch, burnPosition, collectPosition };
}
