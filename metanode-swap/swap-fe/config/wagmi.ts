"use client";

import {
  mainnet,
  polygon,
  optimism,
  arbitrum,
  base,
  sepolia
} from 'wagmi/chains';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const PROJECT_ID = process.env.NEXT_PUBLIC_WALLETCONNECT_ID || '';

export const config = getDefaultConfig({
  appName: 'MetaNode Swap',
  projectId: PROJECT_ID,
  chains: [mainnet, polygon, optimism, arbitrum, base, sepolia],
});