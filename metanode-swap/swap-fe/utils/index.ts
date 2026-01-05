const FEE_TIER_MAP: Record<number, string> = {
  100: '0.01%',
  500: '0.05%',
  3000: '0.30%',
  10000: '1.00%',
};

export function formatFeeTier(feeTier: number): string {
  return FEE_TIER_MAP[feeTier] ?? `${(feeTier / 1_000_000 * 100).toFixed(2)}%`;
}

function tickToPrice(tick: number): number {
  return Math.pow(1.0001, tick);
}

export function formatPriceRange(
  tickLower: number,
  tickUpper: number,
  token0Decimals: number = 18,
  token1Decimals: number = 18,
  isToken0Base: boolean = true
): string {
  // Step 1: Calculate raw prices
  const rawLower = tickToPrice(tickLower);
  const rawUpper = tickToPrice(tickUpper);

  // Step 2: Adjust direction (Token0/Token1)
  const adjustedLower = isToken0Base ? rawLower : 1 / rawLower;
  const adjustedUpper = isToken0Base ? rawUpper : 1 / rawUpper;

  // Step 3: Adjust decimals
  const scale = Math.pow(10, token1Decimals - token0Decimals);
  const scaledLower = adjustedLower * scale;
  const scaledUpper = adjustedUpper * scale;

  // Step 4: Format (clamp extreme values & 4 decimal places)
  const format = (price: number): string => {
    if (price < 0.0001) return "0.0000"; // Clamp near-zero
    if (price > 1000000) return "∞";     // Clamp infinity
    return price.toFixed(4);             // Keep 4 decimals
  };

  return `${format(scaledLower)} — ${format(scaledUpper)}`;
}

export function getCurrentPrice(
  currentTick: number,
  token0Decimals: number = 18,
  token1Decimals: number = 18,
  isToken0Base: boolean = true // 是否以 Token0 为基准
): string {
  // Step 1: 计算基础价格
  const rawPrice = Math.pow(1.0001, currentTick);

  // Step 2: 调整方向
  const adjustedPrice = isToken0Base ? rawPrice : 1 / rawPrice;

  // Step 3: 调整小数位数
  const scaledPrice = adjustedPrice * Math.pow(10, token1Decimals - token0Decimals);

  // Step 4: 格式化（保留 4 位小数）
  return scaledPrice.toFixed(4);
}

export function priceToTick(price: number): number {
  return Math.floor(Math.log(price) / Math.log(1.0001));
}

export function priceToSqrtPriceX96(price: number): bigint {
  return BigInt(Math.floor(Math.sqrt(price) * 2 ** 96));
}

/**
 * liquidity → [amount0, amount1]（BigInt 原生实现）
 * @param liquidity LP 提供的流动性（uint160）
 * @param sqrtRatioX96 当前价格（sqrtPriceX96）
 * @param tickLower 区间下限 tick
 * @param tickUpper 区间上限 tick
 * @param token0Decimals Token0 的小数位数（默认 18）
 * @param token1Decimals Token1 的小数位数（默认 18）
 */
export function liquidityToAmounts(
  liquidity: bigint | string | number,
  sqrtRatioX96: bigint | string | number,
  tickLower: number,
  tickUpper: number,
  token0Decimals: number = 18,
  token1Decimals: number = 18
): [string, string] {
  // 1. 确保所有输入为 BigInt
  const L = BigInt(liquidity.toString());
  const P = BigInt(sqrtRatioX96.toString());

  // 2. 计算 sqrt(P_l) 和 sqrt(P_u)
  const sqrtPLower = BigInt(Math.floor(Math.sqrt(1.0001 ** tickLower) * 2 ** 96));
  const sqrtPUpper = BigInt(Math.floor(Math.sqrt(1.0001 ** tickUpper) * 2 ** 96));

  // 3. 计算 amount0 和 amount1
  let amount0: bigint, amount1: bigint;
  if (P <= sqrtPLower) {
    // 价格低于区间：全部是 amount1
    amount0 = BigInt(0);
    amount1 = L * (sqrtPUpper - sqrtPLower) / BigInt(2 ** 96);
  } else if (P >= sqrtPUpper) {
    // 价格高于区间：全部是 amount0
    amount0 = L * (sqrtPUpper - sqrtPLower) / BigInt(2 ** 96);
    amount1 = BigInt(0);
  } else {
    // 价格在区间内：计算两部分
    amount0 = L * (BigInt(2) ** BigInt(192) / P - sqrtPLower) / BigInt(2 ** 96);
    amount1 = L * (P - sqrtPLower) / BigInt(2 ** 96);
  }

  // 4. 调整小数位数（并格式化为字符串）
  const adjustDecimals = (value: bigint, decimals: number) => {
    return (Number(value) / 10 ** decimals).toFixed(6);
  };

  return [
    adjustDecimals(amount0, token0Decimals), // amount0（如 ETH）
    adjustDecimals(amount1, token1Decimals), // amount1（如 USDC）
  ];
}

