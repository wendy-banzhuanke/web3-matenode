
'use client';
import { Button } from "@/components/ui/button"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

interface WagmiHeaderProps {
  onConnectWallet: () => void; // 或 () => Promise<void>
}

export default function wagmiHeader({ onConnectWallet }:WagmiHeaderProps) {
    return (
        <div className="flex justify-between align-center px-4 py-4 border-b-2 border-b-fuchsia-400">
            <div className="flex align-center">
                <Avatar className="mr-2">
                    <AvatarImage
                    src="https://github.com/evilrabbit.png"
                    alt="@evilrabbit"
                    />
                    <AvatarFallback>ER</AvatarFallback>
                </Avatar>
                <div className="font-bold text-2xl">Wagmi Demo</div>
            </div>
            <div className="flex align-center">
                <Avatar className="rounded-lg mr-4">
                    <AvatarImage
                    src="https://github.com/evilrabbit.png"
                    alt="@evilrabbit"
                    />
                    <AvatarFallback>ER</AvatarFallback>
                </Avatar>
                <Button onClick={onConnectWallet}>Connect Wallet</Button>
            </div>
        </div>
    )
}