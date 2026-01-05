import React, { useState, useMemo } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { useWriteContract, useConnection, useReadContract } from "wagmi";
import { parseEther, erc20Abi } from "viem";
import PositionManagerArtifact from "@/abi/PositionManager.json";
import { usePoolManager } from "@/hooks/usePoolManager";
import TokenSelect from "./TokenSelect";
import { formatFeeTier, formatPriceRange } from "@/utils";
import { PoolType } from "@/types";

const TOKENS = [
  { address: '0xf157b4d79D9A7a1e6e31f3036053154840b4e7F0', symbol: 'DABEN01' },
  { address: '0x3Da8b4e3D12A1861930d9d691Bacbe24B2c093Fa', symbol: 'DUOLIAAA' }
];

export default function AddPosition({
  value,
  setValue,
}: {
  value: boolean;
  setValue: (value: boolean) => void;
}) {
  const [token0, setToken0] = useState("");
  const [token1, setToken1] = useState("");
  const [selectedPoolIndex, setSelectedPoolIndex] = useState<string>("");
  const [amount0, setAmount0] = useState("");
  const [amount1, setAmount1] = useState("");
  
  const { rawPools } = usePoolManager();
  const { address } = useConnection();
  const writeContract = useWriteContract();

  // Check Allowance
  const { data: allowance0, refetch: refetchAllowance0 } = useReadContract({
    address: token0 as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address as `0x${string}`, process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS as `0x${string}`],
    query: {
        enabled: !!token0 && !!address,
    }
  });

  const { data: allowance1, refetch: refetchAllowance1 } = useReadContract({
    address: token1 as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address as `0x${string}`, process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS as `0x${string}`],
    query: {
        enabled: !!token1 && !!address,
    }
  });

  const handleApprove = async (tokenAddress: string, amount: string, refetch: () => void) => {
    if (!tokenAddress || !amount) return;
    try {
        writeContract.mutate({
            address: tokenAddress as `0x${string}`,
            abi: erc20Abi,
            functionName: "approve",
            args: [process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS as `0x${string}`, parseEther(amount)],
        }, {
            onSuccess: () => {
                console.log(`Approved ${tokenAddress}`);
                refetch();
            },
            onError: (error) => {
                console.error(`Failed to approve ${tokenAddress}`, error);
            }
        });
    } catch (e) {
        console.error("Approve failed", e);
    }
  };

  const handleToken0Change = (event: SelectChangeEvent) => {
    setToken0(event.target.value as string);
    setSelectedPoolIndex("");
  };

  const handleToken1Change = (event: SelectChangeEvent) => {
    setToken1(event.target.value as string);
    setSelectedPoolIndex("");
  };

  const availablePools = useMemo(() => {
    if (!rawPools || !token0 || !token1) return [];
    return (rawPools as PoolType[]).filter(p => 
      (p.token0.toLowerCase() === token0.toLowerCase() && p.token1.toLowerCase() === token1.toLowerCase()) || 
      (p.token0.toLowerCase() === token1.toLowerCase() && p.token1.toLowerCase() === token0.toLowerCase())
    );
  }, [rawPools, token0, token1]);

  const handleClose = () => {
    setValue(false);
    setAmount0("");
    setAmount1("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!address || !selectedPoolIndex) return;

    try {
        const pool = availablePools.find(p => p.index.toString() === selectedPoolIndex);
        if (!pool) return;

        // Ensure token order matches pool's definition
        // The PositionManager expects tokens and index to match the pool key
        // We must pass the exact token0 and token1 from the pool struct
        
        writeContract.mutate({
            address: process.env.NEXT_PUBLIC_POSITION_MANAGER_ADDRESS as `0x${string}`,
            abi: PositionManagerArtifact.abi,
            functionName: "mint",
            args: [{
                token0: pool.token0,
                token1: pool.token1,
                index: pool.index,
                amount0Desired: parseEther(amount0 || "0"),
                amount1Desired: parseEther(amount1 || "0"),
                recipient: address,
                deadline: BigInt(Math.floor(Date.now() / 1000) + 60 * 20) // 20 mins
            }]
        }, {
          onSuccess: (data) => {
            console.log("Position minted successfully", data);
            handleClose();
          },
          onError: (error) => {
            console.error("Failed to mint position", error);
          }
        });
        
    } catch (error) {
        console.error("Failed to create position", error);
    }
  };

  return (
    <React.Fragment>
      <Dialog open={value} onClose={handleClose}>
        <DialogTitle>Add Position</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Select a pool and add liquidity.
          </DialogContentText>
          <form onSubmit={handleSubmit} id="add-position-form">
            <div className="flex justify-between items-center border-1 border-green-700 dark:border-green-700 p-2 rounded-md">
              <TokenSelect
                label="Token0"
                value={token0}
                onChange={handleToken0Change}
                tokens={TOKENS}
              />
            </div>
            <div className="flex justify-between items-center border-1 border-green-700 dark:border-green-700 p-2 rounded-md mt-2">
              <TokenSelect
                label="Token1"
                value={token1}
                onChange={handleToken1Change}
                tokens={TOKENS}
              />
            </div>

            {availablePools.length > 0 && (
                <div className="flex justify-between items-center border-1 border-green-700 dark:border-green-700 p-2 rounded-md mt-2">
                <FormControl fullWidth sx={{ m: 1 }}>
                    <InputLabel id="pool-select-label">Select Pool</InputLabel>
                    <Select
                    labelId="pool-select-label"
                    id="pool-select"
                    value={selectedPoolIndex}
                    label="Select Pool"
                    onChange={(e) => setSelectedPoolIndex(e.target.value as string)}
                    >
                    {availablePools.map((pool) => (
                        <MenuItem key={pool.index} value={pool.index.toString()}>
                        Fee: {formatFeeTier(pool.fee)} - Range: {formatPriceRange(pool.tickLower, pool.tickUpper)}
                        </MenuItem>
                    ))}
                    </Select>
                </FormControl>
                </div>
            )}

            {availablePools.length === 0 && token0 && token1 && (
                 <div className="p-2 mt-2 text-red-500">
                    No pools found for this pair. Please create a pool first.
                 </div>
            )}

            <div className="flex justify-between items-center border-1 border-green-700 dark:border-green-700 p-2 rounded-md mt-2">
               <TextField
                required
                margin="dense"
                id="amount0"
                name="amount0"
                label={`Amount ${TOKENS.find(t => t.address === token0)?.symbol || 'Token0'}`}
                type="number"
                variant="standard"
                value={amount0}
                onChange={(e) => setAmount0(e.target.value)}
                fullWidth
              />
            </div>
            <div className="flex justify-between items-center border-1 border-green-700 dark:border-green-700 p-2 rounded-md mt-2">
              <TextField
                required
                margin="dense"
                id="amount1"
                name="amount1"
                label={`Amount ${TOKENS.find(t => t.address === token1)?.symbol || 'Token1'}`}
                type="number"
                variant="standard"
                value={amount1}
                onChange={(e) => setAmount1(e.target.value)}
                fullWidth
              />
            </div>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          
          {token0 && amount0 && (!allowance0 || allowance0 < parseEther(amount0)) ? (
              <Button onClick={() => handleApprove(token0, amount0, refetchAllowance0)}>
                  Approve {TOKENS.find(t => t.address === token0)?.symbol || 'Token0'}
              </Button>
          ) : null}

          {token1 && amount1 && (!allowance1 || allowance1 < parseEther(amount1)) ? (
              <Button onClick={() => handleApprove(token1, amount1, refetchAllowance1)}>
                  Approve {TOKENS.find(t => t.address === token1)?.symbol || 'Token1'}
              </Button>
          ) : null}

          <Button 
            type="submit" 
            form="add-position-form" 
            disabled={
                !selectedPoolIndex || 
                !amount0 || 
                !amount1 || 
                (!!allowance0 && allowance0 < parseEther(amount0)) || 
                (!!allowance1 && allowance1 < parseEther(amount1))
            }
          >
            Mint Position
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}
