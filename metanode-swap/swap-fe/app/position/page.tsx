"use client"

import React, { useState, useEffect } from "react";
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import { usePositionManager, PositionInfo } from '@/hooks/usePositionManager';
import { usePoolManager } from '@/hooks/usePoolManager';
import { PositionRow, PoolType } from '@/types/index';
import { formatFeeTier, formatPriceRange, getCurrentPrice, liquidityToAmounts } from "@/utils/index";
import AddPosition from "@/component/AddPosition";

export default function Position() {
  const { positions, isLoading, error, burnPosition, collectPosition } = usePositionManager();
  const { getTokenSymbol, rawPools } = usePoolManager();

  const [addPositionOpen, setAddPositionOpen] = useState(false);
  const [rowPositions, setRows] = useState<PositionRow[]>([]);

  useEffect(() => {
    const fetchPositionsData = async () => {
      if (!positions || !rawPools) return;
      
      const positionsData = await Promise.all((positions as PositionInfo[]).map(async (position) => {
        const pool = (rawPools as PoolType[]).find(p => 
            p.token0.toLowerCase() === position.token0.toLowerCase() &&
            p.token1.toLowerCase() === position.token1.toLowerCase() &&
            Number(p.index) === Number(position.index)
        );

        const token0 = await getTokenSymbol(position.token0 as `0x${string}`)
        const token1 = await getTokenSymbol(position.token1 as `0x${string}`)
        
        const sqrtPriceX96 = pool ? BigInt(pool.sqrtPriceX96) : BigInt(0);
        const currentTick = pool ? Number(pool.tick) : 0;

        return { 
          id: position.id.toString(),
          token0: token0 as string || "UNKNOWN",
          token1: token1 as string || "UNKNOWN",
          token0Addr: position.token0,
          token1Addr: position.token1,
          feeTier: formatFeeTier(position.fee),
          tickLower: position.tickLower,
          tickUpper: position.tickUpper,
          currentPrice: getCurrentPrice(currentTick),
          liquidity: liquidityToAmounts(position.liquidity, sqrtPriceX96, position.tickLower, position.tickUpper).toString(),
        }
      }));
      setRows(positionsData);
    };

    fetchPositionsData();
  }, [positions, rawPools]);

  const handleRemovePosition = (positionId: bigint) => {
    burnPosition(positionId);
  }

  const handleCollectPosition = (positionId: bigint) => {
    console.log("positionId====", positionId)
    collectPosition(positionId);
  }

  return (
    <div>
      <h1 className='font-bold text-xl pb-2'>Position</h1>
      <TableContainer component={Paper} className='p-4'>
        <div className="pb-2 flex justify-end">
          <Button variant="outlined" onClick={()=>setAddPositionOpen(true)}  className='ml-2'>Add Position</Button>
        </div>
        <Table aria-label="simple table">
          <TableHead className='bg-green-100 text-white'>
            <TableRow>
              <TableCell>Token</TableCell>
              <TableCell align="right">Fee tier</TableCell>
              <TableCell align="right">Set price range</TableCell>
              <TableCell align="right">Current price</TableCell>
              <TableCell align="right">Liquidity</TableCell>
              <TableCell align="right">Action</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          {rowPositions.map((row, index) => (
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
              <TableCell align="right" className="w-[230px]">
                <div className="w-full flex justify-between">
                  <Button variant="outlined" onClick={()=>handleRemovePosition(BigInt(row.id))}>Remove</Button>
                  <Button variant="outlined" onClick={()=>handleCollectPosition(BigInt(row.id))}>Collect</Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          </TableBody>
        </Table>
      </TableContainer>
      <AddPosition value={addPositionOpen} setValue={setAddPositionOpen} />
    </div>
  );
}