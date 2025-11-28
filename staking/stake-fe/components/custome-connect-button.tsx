'use client';

// import Image from "next/image";
import { useBalance, useConnection } from "wagmi";
import { formatUnits } from "viem";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Button } from "@/components/ui/button";

export default function CustomConnectButton() {
  const { address } = useConnection();
  const { data, isLoading } = useBalance({
    address,
  });

  const balance = isLoading
    ? "Loading..."
    : data
    ? `${Number(formatUnits(data.value, data.decimals)).toFixed(4)} ${data.symbol}`
    : "0 ETH";

  console.log("balance===", balance)

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== 'loading';
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus ||
            authenticationStatus === 'authenticated');

        return (
          <div
            {...(!ready && {
              'aria-hidden': true,
              'style': {
                opacity: 0,
                pointerEvents: 'none',
                userSelect: 'none',
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <Button onClick={openConnectModal} type="button" className="rounded-lg bg-blue-600 text-white font-bold  cursor-pointer hover:bg-blue-700 hover:scale-106 transition-all duration-300">
                    Connect Wallet
                  </Button>
                );
              }

              if (chain.unsupported) {
                return (
                  <Button onClick={openChainModal} variant="destructive" type="button">
                    Wrong network
                  </Button>
                );
              }

              return (
                <div style={{ display: 'flex', gap: 12 }}>
                  <Button
                    onClick={openChainModal}
                    style={{ display: 'flex', alignItems: 'center' }}
                    type="button"
                    variant="outline"
                    className="text-stone-500 cursor-pointer"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: 'hidden',
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? 'Chain icon'}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </Button>

                  <Button onClick={openAccountModal} type="button" variant="outline" className="text-stone-500 cursor-pointer">
                     {/* 大屏幕显示余额 */}
                     <span className="hidden md:block mr-2">
                      {balance}
                    </span>
                    {account.displayName}
                  </Button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
}
