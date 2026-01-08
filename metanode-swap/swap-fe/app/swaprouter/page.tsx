"use client";

import React, { useState, useEffect, useMemo } from "react";
import { TickMath } from "@uniswap/v3-sdk";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  IconButton
} from "@mui/material";
import { useConnection, useWriteContract, useReadContract, usePublicClient } from "wagmi";
import { parseEther, formatEther, erc20Abi } from "viem";
import SwapRouterArtifact from "@/abi/SwapRouter.json";
import TokenSelect from "@/component/TokenSelect";
import SettingSlippage from "@/component/SettingSlippage";
import { usePoolManager } from "@/hooks/usePoolManager";
import { PoolType } from "@/types";

const TOKENS = [
  { address: "0xf157b4d79D9A7a1e6e31f3036053154840b4e7F0", symbol: "DABEN01" },
  { address: "0x3Da8b4e3D12A1861930d9d691Bacbe24B2c093Fa", symbol: "DUOLIAAA" },
];

const SWAP_ROUTER_ADDRESS = process.env.NEXT_PUBLIC_SWAP_ROUTER_ADDRESS as `0x${string}`;

export default function Swap() {
  const { address } = useConnection();
  const { rawPools } = usePoolManager();
  const publicClient = usePublicClient();
  const writeContract = useWriteContract();

  const [tokenIn, setTokenIn] = useState<string>("");
  const [tokenOut, setTokenOut] = useState<string>("");
  const [amountIn, setAmountIn] = useState<string>("");
  const [amountOut, setAmountOut] = useState<string>("");
  const [loadingQuote, setLoadingQuote] = useState(false);
  const [quotingError, setQuotingError] = useState<string | null>(null);
  const [currentPool, setCurrentPool] = useState<PoolType | undefined>(undefined);
  const [slippage, setSlippage] = useState<number>(5.5);

  // Balances
  const { data: balanceIn, refetch: refetchBalanceIn } = useReadContract({
    address: tokenIn as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!tokenIn && !!address },
  });

  const { data: balanceOut, refetch: refetchBalanceOut } = useReadContract({
    address: tokenOut as `0x${string}`,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address as `0x${string}`],
    query: { enabled: !!tokenOut && !!address },
  });

  // Allowance
  const { data: allowanceIn, refetch: refetchAllowanceIn } = useReadContract({
    address: tokenIn as `0x${string}`,
    abi: erc20Abi,
    functionName: "allowance",
    args: [address as `0x${string}`, SWAP_ROUTER_ADDRESS],
    query: { enabled: !!tokenIn && !!address && !!SWAP_ROUTER_ADDRESS },
  });

  // Find direct pool
  const poolIndex = useMemo(() => {
    if (!rawPools || !tokenIn || !tokenOut) return null;
    const pool = (rawPools as PoolType[]).find(
      (p) =>
        (p.token0.toLowerCase() === tokenIn.toLowerCase() &&
          p.token1.toLowerCase() === tokenOut.toLowerCase()) ||
        (p.token0.toLowerCase() === tokenOut.toLowerCase() &&
          p.token1.toLowerCase() === tokenIn.toLowerCase())
    );
    setCurrentPool(pool)
    return pool ? pool.index : null;
  }, [rawPools, tokenIn, tokenOut]);

  // Quote
  useEffect(() => {
    const fetchQuote = async () => {
      if (!amountIn || !tokenIn || !tokenOut || poolIndex === null || !publicClient) {
        setAmountOut("");
        return;
      }

      setLoadingQuote(true);
      setQuotingError(null);
      try {
        const amountInBigInt = parseEther(amountIn);
        if (amountInBigInt === 0n) {
            setAmountOut("");
            setLoadingQuote(false);
            return;
        }

        // const currentSqrtPriceX96 = currentPool?.sqrtPriceX96 as bigint; // 从池子获取当前价格
        // const sqrtPriceLimitX96 = currentSqrtPriceX96 * 90n / 100n; // 允许价格下跌10%
        // const minAllowedPrice = currentSqrtPriceX96 * 90n / 100n;
        // const sqrtPriceLimitX96 = minAllowedPrice > TickMath.MIN_SQRT_RATIO 
        //   ? minAllowedPrice 
        //   : TickMath.MIN_SQRT_RATIO;
        const isToken0ToToken1 = tokenIn.toLowerCase() < tokenOut.toLowerCase();
        const MIN_SQRT_RATIO = BigInt(TickMath.MIN_SQRT_RATIO.toString());
        const MAX_SQRT_RATIO = BigInt(TickMath.MAX_SQRT_RATIO.toString());
        const sqrtPriceLimitX96 = isToken0ToToken1 
          ? MIN_SQRT_RATIO + 1n  // 允许价格跌到最低比例
          : MAX_SQRT_RATIO - 1n; // 允许价格上涨到最高比例

        // const sqrtPriceLimitX96: bigint = minAllowedPrice < TickMath.MAX_SQRT_RATIO
				// ? BigInt(TickMath.MIN_SQRT_RATIO.toString()) + 1n
				// : BigInt(TickMath.MAX_SQRT_RATIO.toString()) - 1n;

        // QuoteExactInputParams
        const params = {
          tokenIn: tokenIn as `0x${string}`,
          tokenOut: tokenOut as `0x${string}`,
          indexPath: [poolIndex] as unknown as number[], 
          amountIn: amountInBigInt,
          sqrtPriceLimitX96: sqrtPriceLimitX96, // 0 means no limit
        };

        const result = await publicClient.readContract({
          address: SWAP_ROUTER_ADDRESS,
          abi: SwapRouterArtifact.abi,
          functionName: "quoteExactInput",
          args: [params],
        });

        const quotedAmount = result as unknown as bigint;
        setAmountOut(formatEther(quotedAmount));
      } catch (error) {
        console.error("Quote error:", error);
        setQuotingError("Failed to fetch quote");
        setAmountOut("");
      } finally {
        setLoadingQuote(false);
      }
    };

    const timer = setTimeout(fetchQuote, 500); // Debounce
    return () => clearTimeout(timer);
  }, [amountIn, tokenIn, tokenOut, poolIndex, publicClient]);

  const handleApprove = () => {
    if (!tokenIn) return;
    writeContract.mutate(
      {
        address: tokenIn as `0x${string}`,
        abi: erc20Abi,
        functionName: "approve",
        args: [SWAP_ROUTER_ADDRESS, parseEther(amountIn || "0")],
      },
      {
        onSuccess: () => {
          console.log("Approve success");
          refetchAllowanceIn();
        },
        onError: (err) => console.error("Approve error", err),
      }
    );
  };

  const handleSwap = () => {
    if (!tokenIn || !tokenOut || !amountIn || poolIndex === null || !address) return;

    // const currentSqrtPriceX96 = currentPool?.sqrtPriceX96 as bigint; // 从池子获取当前价格
    // const sqrtPriceLimitX96 = currentSqrtPriceX96 * 90n / 100n; // 允许价格下跌10%
    
    // TODO 90n / 100n 要写成动态的，根据页面传入的滑点来动态计算
    const amountOutMinimum = parseEther(amountOut || "0") * 90n / 100n;
    
    const isToken0ToToken1 = tokenIn.toLowerCase() < tokenOut.toLowerCase();
    const MIN_SQRT_RATIO = BigInt(TickMath.MIN_SQRT_RATIO.toString());
    const MAX_SQRT_RATIO = BigInt(TickMath.MAX_SQRT_RATIO.toString());
    const sqrtPriceLimitX96 = isToken0ToToken1 
      ? MIN_SQRT_RATIO + 1n  // 允许价格跌到最低比例
      : MAX_SQRT_RATIO - 1n; // 允许价格上涨到最高比例
          
    writeContract.mutate(
      {
        address: SWAP_ROUTER_ADDRESS,
        abi: SwapRouterArtifact.abi,
        functionName: "exactInput",
        args: [
          {
            tokenIn: tokenIn as `0x${string}`,
            tokenOut: tokenOut as `0x${string}`,
            indexPath: [poolIndex] as unknown as number[],
            recipient: address,
            deadline: BigInt(Math.floor(Date.now() / 1000) + 1200), // 20 mins
            amountIn: parseEther(amountIn),
            amountOutMinimum: amountOutMinimum, 
            sqrtPriceLimitX96: sqrtPriceLimitX96, 
          },
        ],
      },
      {
        onSuccess: () => {
          console.log("Swap success");
          setAmountIn("");
          setAmountOut("");
          refetchBalanceIn();
          refetchBalanceOut();
        },
        onError: (err) => console.error("Swap error", err),
        onSettled: (data) => {
          console.log("Swap settled==", data);
        }
      }
    );
  };

  const handleSwitchTokens = () => {
    setTokenIn(tokenOut);
    setTokenOut(tokenIn);
    setAmountIn(""); 
    setAmountOut("");
  };

  const needsApproval =
    tokenIn &&
    amountIn &&
    allowanceIn !== undefined &&
    allowanceIn < parseEther(amountIn || "0");

  const isSwapDisabled =
    !tokenIn ||
    !tokenOut ||
    !amountIn ||
    loadingQuote ||
    !amountOut ||
    needsApproval ||
    poolIndex === null;

  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      minHeight="80vh"
    >
      <Card sx={{ maxWidth: 480, width: "100%", borderRadius: 4, boxShadow: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Typography variant="h5" align="justify" fontWeight="bold" mb={2} className="w-[100%] flex items-center justify-between">
            <span className="mr-2">Swap</span>
            <SettingSlippage slippage={slippage} setSlippage={setSlippage} />
          </Typography>

          {/* From Token */}
          <Box
            bgcolor="action.hover"
            p={2}
            borderRadius={2}
            mb={1}
            border={1}
            borderColor="divider"
          >
            <Typography variant="body2" color="text.secondary" mb={1}>
              You pay
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                variant="standard"
                placeholder="0"
                value={amountIn}
                onChange={(e) => setAmountIn(e.target.value)}
                InputProps={{
                  disableUnderline: true,
                  style: { fontSize: "2rem", fontWeight: 500 },
                }}
                fullWidth
              />
              <TokenSelect
                label=""
                value={tokenIn}
                onChange={(e) => setTokenIn(e.target.value as string)}
                tokens={TOKENS}
              />
            </Box>
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="caption" color="text.secondary">
                {/* $0.00 (Fiat placeholder) */}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {
                  allowanceIn !== undefined ?  `Approve: ${formatEther(allowanceIn)}` : "Approve:0.00"
                }
                <span className="ml-2">
                  Balance: {balanceIn ? parseFloat(formatEther(balanceIn)).toFixed(4) : "0.00"}
                </span>
              </Typography>
            </Box>
          </Box>

          {/* Switch Button */}
          <Box display="flex" justifyContent="center" my={-2} position="relative" zIndex={1}>
            <Box bgcolor="background.paper" borderRadius="50%" p={0.5} border={1} borderColor="divider">
                <IconButton size="small" onClick={handleSwitchTokens}>
                {/* <ArrowDownwardIcon fontSize="small" /> */}
                ↓
                </IconButton>
            </Box>
          </Box>

          {/* To Token */}
          <Box
            bgcolor="action.hover"
            p={2}
            borderRadius={2}
            mt={1}
            mb={3}
            border={1}
            borderColor="divider"
          >
            <Typography variant="body2" color="text.secondary" mb={1}>
              You receive
            </Typography>
            <Box display="flex" alignItems="center" gap={1}>
              <TextField
                variant="standard"
                placeholder="0"
                value={loadingQuote ? "Loading..." : amountOut}
                InputProps={{
                  disableUnderline: true,
                  readOnly: true,
                  style: { fontSize: "2rem", fontWeight: 500 },
                }}
                fullWidth
              />
              <TokenSelect
                label=""
                value={tokenOut}
                onChange={(e) => setTokenOut(e.target.value as string)}
                tokens={TOKENS}
              />
            </Box>
            <Box display="flex" justifyContent="space-between" mt={1}>
              <Typography variant="caption" color="text.secondary">
                {/* $0.00 */}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Balance: {balanceOut ? parseFloat(formatEther(balanceOut)).toFixed(4) : "0.00"}
              </Typography>
            </Box>
          </Box>
          
          {quotingError && (
            <Typography color="error" variant="caption" display="block" mb={2}>
                {quotingError} {poolIndex === null && tokenIn && tokenOut && "(No pool found)"}
            </Typography>
          )}

          {/* Action Button */}
          {needsApproval ? (
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleApprove}
              sx={{ borderRadius: 3, py: 1.5, fontSize: "1.1rem", textTransform: "none" }}
            >
              Approve {TOKENS.find(t => t.address === tokenIn)?.symbol}
            </Button>
          ) : (
            <Button
              variant="contained"
              fullWidth
              size="large"
              onClick={handleSwap} 
              disabled={isSwapDisabled}
              sx={{ borderRadius: 3, py: 1.5, fontSize: "1.1rem", textTransform: "none" }}
            >
              {poolIndex === null && tokenIn && tokenOut ? "No Pool Found" : "Swap"}
            </Button>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
