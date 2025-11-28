/*
 * @Author: zhangjian
 * @Date: 2025-11-28 10:46:15
 * @LastEditTime: 2025-11-28 17:36:36
 * @LastEditors: zhangjian
 * @Description: 质押组件
 */

import { useConnection } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@/components/ui/input-group"
import { Button } from "@/components/ui/button"
export default function Stake() {
  const { isConnected } = useConnection();

  const balanceByType = [{
    type: "ETH",
    balance: "0.0000",
    title: "Staked Amount"
  }, {
    type: "ETH",
    balance: "0.0000",
    title: "Available to Withdraw"
  }, {
    type: "ETH",
    balance: "0.0000",
    title: "Pending Withdraw"
  }]

  return (
    <div className="w-full p-4 pt-6">
      {/* flex flex-col items-center justify-center */}
      <div className="text-stone-400 text-3xl text-center">Withdraw ETH</div>
      <div className="text-stone-500 text-xl text-center pt-2">Unstake and withdraw your ETH</div>
      <div className="grid gap-4 grid-cols-3 pt-4">
        {
          balanceByType.map(item => {
            return (
              <div key={item.title} className="bg-white rounded-lg flex flex-col items-center gap-2 p-2">
                <h6 className="text-stone-900 text-sm">{item.title}</h6>
                <p className="text-stone-900 text-sm">{item.balance} {item.type}</p>
              </div>
            )
          })
        }
      </div>
      <div className="font-semibold text-2xl text-white mt-8">Unstake</div>
      <div className=" text-white w-full border border-stone-500 rounded-md  my-2 p-4">
        <Label htmlFor="amount" className="py-2">Amount to Stake</Label>
        <InputGroup className="mb-4">
          <InputGroupInput  id="amount" placeholder="0.00" />
          <InputGroupAddon align="inline-end">
            <InputGroupText className="text-white">ETH</InputGroupText>
          </InputGroupAddon>
        </InputGroup>
        {/* <div className="text-stone-400 text-sm py-2">Available: 0.6294 ETH</div> */}

        <div className="flex justify-center">
          {isConnected ? 
            <Button variant="outline" size="lg" className="cursor-pointer">Unstake</Button> : 
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
            />}
        </div>
      </div>
      <div className="font-semibold text-2xl text-white mt-6">Withdraw</div>
      <div className="flex justify-between items-center bg-white rounded-lg p-4 mt-2">
        <div>
          <p className="text-sm text-stone-700">Ready to Withdraw</p>
          <div className="text-2xl font-bold text-stone-500">0.0000 ETH</div>
        </div>
        <div className="text-sm text-stone-400">20 min cooldown</div>
      </div>
     <div className="flex justify-center mt-4">
       <Button variant="outline" size="lg" className="cursor-pointer">Withdraw ETH</Button>
     </div>
    </div>
  )
}