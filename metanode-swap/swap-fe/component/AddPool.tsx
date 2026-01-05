import React, { useState } from "react";
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
import { useWriteContract } from "wagmi";
import PoolManagerArtifact from "@/abi/PoolManager.json";
import { priceToSqrtPriceX96, priceToTick } from "@/utils";

import TokenSelect from "./TokenSelect";

const FEE_TIERS = [{
  value: "0.01", // 1.00% -> 10000
  label: "1.00%",
}, {
  value: "0.003", // 0.30% -> 3000
  label: "0.30%",
}, {
  value: "0.0005", // 0.05% -> 500
  label: "0.05%",
}, {
  value: "0.0001", // 0.01% -> 100
  label: "0.01%",
}];

const TICK_SPACINGS: Record<number, number> = {
  100: 1,
  500: 10,
  3000: 60,
  10000: 200
};

const TOKENS = [
  { address: '0xf157b4d79D9A7a1e6e31f3036053154840b4e7F0', symbol: 'DABEN01' },
  { address: '0x3Da8b4e3D12A1861930d9d691Bacbe24B2c093Fa', symbol: 'DUOLIAAA' }
];

export default function AddPool({
  value,
  setValue,
}: {
  value: boolean;
  setValue: (value: boolean) => void;
}) {
  const [token0, setToken0] = useState("");
  const [token1, setToken1] = useState("");
  const [feeTier, setFeeTier] = useState("");
  
  const writeContract = useWriteContract();

  const handleToken0Change = (event: SelectChangeEvent) => {
    setToken0(event.target.value as string);
  };

  const handleToken1Change = (event: SelectChangeEvent) => {
    setToken1(event.target.value as string);
  };

  const handleFeeTierChange = (event: SelectChangeEvent) => {
    setFeeTier(event.target.value as string);
  };

  const token0Symbol = TOKENS.find(t => t.address === token0)?.symbol || "Token0";
  const token1Symbol = TOKENS.find(t => t.address === token1)?.symbol || "Token1";
  const priceHelperText = `${token1Symbol} per ${token0Symbol}`;

  const handleClose = () => {
    setValue(false);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const formJson = Object.fromEntries((formData as unknown as FormData).entries());
    
    try {
        const tokenA = token0;
        const tokenB = token1;
        const fee = Number(feeTier) * 1000000;
        
        const price = Number(formJson.initialPrice);
        const lowPrice = Number(formJson.lowPrice);
        const highPrice = Number(formJson.highPrice);
        console.log("formJson===", formJson)
        
        // Sort tokens
        const sorted = tokenA.toLowerCase() < tokenB.toLowerCase();
        const token0Addr = sorted ? tokenA : tokenB;
        const token1Addr = sorted ? tokenB : tokenA;
        
        const adjustedPrice = sorted ? price : 1 / price;
        const adjustedLow = sorted ? lowPrice : 1 / highPrice;
        const adjustedHigh = sorted ? highPrice : 1 / lowPrice;
        
        const finalLow = Math.min(adjustedLow, adjustedHigh);
        const finalHigh = Math.max(adjustedLow, adjustedHigh);

        const sqrtPriceX96 = priceToSqrtPriceX96(adjustedPrice);
        const rawTickLower = priceToTick(finalLow);
        const rawTickUpper = priceToTick(finalHigh);
        
        const spacing = TICK_SPACINGS[fee] || 60;
        const tickLower = Math.floor(rawTickLower / spacing) * spacing;
        const tickUpper = Math.floor(rawTickUpper / spacing) * spacing;

        await writeContract.mutate({
            address: process.env.NEXT_PUBLIC_POOL_MANAGER_ADDRESS as `0x${string}`,
            abi: PoolManagerArtifact.abi,
            functionName: "createAndInitializePoolIfNecessary",
            args: [{
                token0: token0Addr,
                token1: token1Addr,
                fee: fee,
                tickLower: tickLower,
                tickUpper: tickUpper,
                sqrtPriceX96: sqrtPriceX96
            }]
        }, {
          onSuccess: (data) => {
            // handleClose();
            console.error("Failed to create pool-onSuccess", data);
          },
          onError: (error) => {
            console.error("Failed to create pool-error", error);
          },
          onSettled: (data) => {
            console.error("Failed to create pool-settled", data);
            // handleClose();
          }
        });
        
        handleClose();
    } catch (error) {
        console.error("Failed to create pool", error);
    }
  };

  return (
    <React.Fragment>
      <Dialog open={value} onClose={handleClose}>
        <DialogTitle>Add Pool</DialogTitle>
        <DialogContent>
          <DialogContentText>
            To add a pool, please select tokens, fee tier, and set the initial price and range.
          </DialogContentText>
          <form onSubmit={handleSubmit} id="add-pool-form">
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
            <div className="flex justify-between items-center border-1 border-green-700 dark:border-green-700 p-2 rounded-md mt-2">
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel id="demo-simple-select-helper-label1">Fee Tier</InputLabel>
                <Select
                  labelId="demo-simple-select-helper-label1"
                  id="demo-simple-select-helper1"
                  value={feeTier}
                  label="Fee Tier"
                  onChange={handleFeeTierChange}
                >
                  {FEE_TIERS.map((feeTier) => (
                    <MenuItem key={feeTier.value} value={feeTier.value}>
                      {feeTier.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
            <div className="flex justify-between items-center border-1 border-green-700 dark:border-green-700 p-2 rounded-md mt-2">
               <TextField
                required
                margin="dense"
                id="initialPrice"
                name="initialPrice"
                label="Initial Price"
                variant="standard"
                helperText={priceHelperText}
              />
            </div>
            <div className="flex justify-between items-center border-1 border-green-700 dark:border-green-700 p-2 rounded-md mt-2">
              <TextField
                required
                margin="dense"
                id="lowPrice"
                name="lowPrice"
                label="Low price"
                variant="standard"
                helperText={priceHelperText}
              />
              <TextField
                required
                margin="dense"
                id="highPrice"
                name="highPrice"
                label="High price"
                variant="standard"
                helperText={priceHelperText}
              />
            </div>
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button type="submit" form="add-pool-form">
            Add Pool
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
}

