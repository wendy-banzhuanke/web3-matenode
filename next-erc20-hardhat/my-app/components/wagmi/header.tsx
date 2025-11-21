
'use client';
import { useConnection } from 'wagmi'
import { Button } from "../ui/button";
import { ConnectWallet } from "./connect-wallet";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import { Account } from './account';

export default function WagmiHeader() {    
    const { isConnected } = useConnection();
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
                {isConnected ? (
                    <Account />
                ) : (
                    <ConnectWallet />
                )}
            </div>
        </div>
    )
}