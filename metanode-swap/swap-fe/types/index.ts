export interface Token {
  address: string;
  symbol: string;
}

export interface PoolType {
  token0: string;
  token1: string;
  index: number;
  fee: number;
  tickLower: number;
  tickUpper: number;
  tick: number;
  liquidity: string | number | bigint;
  sqrtPriceX96: string | number | bigint;
}

export interface PoolRow {
  token0: string;
  token1: string;
  token0Addr: string;
  token1Addr: string;
  feeTier: number|string;
  tickLower: number;
  tickUpper: number;
  currentPrice: string | number;
  liquidity: string;
}

export interface PositionType {
  token0: string;
  token1: string;
  pool: string;
  fee: number;
  tick: number;
  tickLower: number;
  tickUpper: number;
  liquidity: string | number | bigint;
  sqrtPriceX96: string | number | bigint;
}

export interface PositionRow {
  token0: string;
  token1: string;
  token0Addr: string;
  token1Addr: string;
  feeTier: number|string;
  tickLower: number;
  tickUpper: number;
  currentPrice: string | number;
  liquidity: string;
}