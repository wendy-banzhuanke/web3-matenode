"use client";

import '@rainbow-me/rainbowkit/styles.css';
import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { config } from "../config/wagmi";

import React, { useState } from "react";
import { useRouter } from "next/navigation"
import Header from '@/component/header';

export function Providers({ children }: { children: React.ReactNode }) {
  const queryClient = new QueryClient();

  const router = useRouter();
  const [tabActive, setTabActive] = useState(1);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabActive(newValue);
    router.push(newValue == 0 ? `/swaprouter` : `/pool`);
  }
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <Header value={tabActive} handleChange={handleTabChange} />
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
