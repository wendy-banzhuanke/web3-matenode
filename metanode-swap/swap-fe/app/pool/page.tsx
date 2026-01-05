"use client"

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation"
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import AddPool from '@/component/AddPool';
import { usePoolManager } from "@/hooks/usePoolManager";
import { PoolType, PoolRow } from "@/types";
import { formatFeeTier, formatPriceRange, getCurrentPrice, liquidityToAmounts } from "@/utils/index";


export default function Pool() {
  const { rawPools, getTokenSymbol, isLoading, error } = usePoolManager();
  const [addPoolOpen, setAddPoolOpen] = useState(false);
  const [rows, setRows] = useState<PoolRow[]>([]);
  const router = useRouter();
  
  useEffect(() => {
    const fetchPoolsData = async () => {
      if (!rawPools) return;
      
      const poolsData = await Promise.all((rawPools as PoolType[]).map(async (pool: PoolType) => {
        const token0 = await getTokenSymbol(pool.token0 as `0x${string}`)
        const token1 = await getTokenSymbol(pool.token1 as `0x${string}`)
        return { 
          token0: token0 as string || "UNKNOWN",
          token1: token1 as string || "UNKNOWN",
          token0Addr: pool.token0,
          token1Addr: pool.token1,
          feeTier: formatFeeTier(pool.fee),
          tickLower: pool.tickLower,
          tickUpper: pool.tickUpper,
          currentPrice: getCurrentPrice(pool.tick),
          liquidity: liquidityToAmounts(pool.liquidity, pool.sqrtPriceX96, pool.tickLower, pool.tickUpper).toString(),
        }
      }));
      setRows(poolsData);
    };

    fetchPoolsData();
  }, [rawPools]);

  return (
    <div className='px-8 py-4'>
      <h1 className='font-bold text-xl pb-2'>Pool</h1>
      <TableContainer component={Paper} className='p-4'>
        <div className="pb-2 flex justify-end">
          <Button variant="contained" className='mr-2' onClick={()=>router.push("/position")}>MyPositions</Button>
          <span className="w-2 h-2"></span>
          <Button variant="outlined" onClick={()=>setAddPoolOpen(true)}  className='ml-2'>Add Pool</Button>
        </div>
        <Table aria-label="simple table">
          <TableHead className='bg-green-100 text-white'>
            <TableRow>
              <TableCell>Token</TableCell>
              <TableCell align="right">Fee tier</TableCell>
              <TableCell align="right">Set price range</TableCell>
              <TableCell align="right">Current price</TableCell>
              <TableCell align="right">Liquidity</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {rows.map((row, index) => (
              <TableRow
                key={`${row.token0Addr}-${row.token1Addr}-${row.tickLower}-${row.tickUpper}-${index}`}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
              <TableCell component="th" scope="row">
                {row.token0 + ' / ' + row.token1}
              </TableCell>
              <TableCell align="right">{row.feeTier}</TableCell>
              <TableCell align="right">{formatPriceRange(row.tickLower,row.tickUpper)}</TableCell>
              <TableCell align="right">{row.currentPrice}</TableCell>
              <TableCell align="right">{row.liquidity}</TableCell>
              </TableRow>
          ))}
          </TableBody>
        </Table>
      </TableContainer>

      <AddPool value={addPoolOpen} setValue={setAddPoolOpen} />

      {error && <p className="text-red-500">Error: {error.message}</p>}
    </div>
  );
}