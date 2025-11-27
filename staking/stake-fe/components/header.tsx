/*
 * @Author: zhangjian
 * @Date: 2025-11-27 16:42:37
 * @LastEditTime: 2025-11-27 16:57:47
 * @LastEditors: zhangjian
 * @Description: 描述
 */
"use client"

import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useConnection, useChainId } from 'wagmi'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export default function Header() {

  const { isConnected, address } = useConnection();
  const chainId = useChainId();

  return (
    <div className="flex items-center justify-between border-b-2 border-gray-200 h-20 px-5">
      <div className="flex items-center gap-4">
        <Avatar className="rounded-lg">
          <AvatarImage
            src="https://github.com/evilrabbit.png"
            alt="@evilrabbit"
          />
          <AvatarFallback>ER</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-bold">Stake Demo</h1>
      </div>
      <div>
        <ConnectButton 
          label="连接钱包"  // 自定义未连接时的按钮文字
          accountStatus="address"
          chainStatus={{
            smallScreen: "none",
            largeScreen: "icon"
          }}
          showBalance={{
            smallScreen: false, // 小屏幕隐藏余额
            largeScreen: true   // 大屏幕显示余额
          }}
        />
      </div>
    </div>
  )
}