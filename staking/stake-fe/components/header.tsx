/*
 * @Author: zhangjian
 * @Date: 2025-11-27 16:42:37
 * @LastEditTime: 2025-11-27 16:57:47
 * @LastEditors: zhangjian
 * @Description: 描述
 */

import { ConnectButton } from '@rainbow-me/rainbowkit';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export default function Header() {
  return (
    <div className="flex items-center justify-between">
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
        <ConnectButton />
      </div>
    </div>
  )
}