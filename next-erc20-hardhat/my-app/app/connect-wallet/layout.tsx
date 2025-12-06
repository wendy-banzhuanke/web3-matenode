'use client'; 

import WalletConnectProvider from '@wendy-banzhuanke/wallet-connect-kit';

export default function WagmiLayout({
  children, 
}: {
  children: React.ReactNode;
}) {
  return (
    <WalletConnectProvider.WalletConnectKitProvider>
      {children}
    </WalletConnectProvider.WalletConnectKitProvider>
  );
}
