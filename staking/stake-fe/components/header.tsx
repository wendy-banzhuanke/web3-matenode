/*
 * @Author: zhangjian
 * @Date: 2025-11-27 16:42:37
 * @LastEditTime: 2025-11-28 15:48:30
 * @LastEditors: zhangjian
 * @Description: header组件，用于连接钱包
 */
"use client"

import {useState} from 'react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useConnection, useChainId } from 'wagmi'
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import Navigation from "@/components/navigation"

export default function Header({currentMenu, onMenuChange}: {currentMenu: number, onMenuChange: (index: number) => void}) {

  const { isConnected, address } = useConnection();
  const chainId = useChainId();

  const menuList = [{
    name: 'stake',
    index: 0,
  }, {
    name: 'withdraw',
    index: 1,
  }]
  
  return (
    <div className="flex items-center justify-between py-5 px-20 bg-primary text-primary-foreground w-full">
      <div className="flex items-center gap-4">
        <Avatar className="rounded-lg border-2 border-primary-foreground">
          <AvatarImage
            src="https://github.com/evilrabbit.png"
            alt="@evilrabbit"
          />
          <AvatarFallback>ER</AvatarFallback>
        </Avatar>
        <h1 className="text-2xl font-semibold">Stake Demo{chainId}</h1>
      </div>
      <div>
        <Navigation menuList={menuList} currentMenu={currentMenu} onChange={onMenuChange}/>
      </div>
      <div>
        <ConnectButton 
          label="connect wallet"  // 自定义未连接时的按钮文字
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