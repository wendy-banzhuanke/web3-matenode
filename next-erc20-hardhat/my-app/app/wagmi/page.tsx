'use client';

import {  useState } from 'react'
import Link from 'next/link';
// import { useBalance } from 'wagmi'
import { getBalance } from '@wagmi/core'
import { formatEther } from "viem";
import { config } from "@/utils/wagmi/config";
import WagmiHeader from "@/components/wagmi/header";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export default function Page() {
    const [inputAddress, setInputAddress] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [balance, setBalance] = useState<bigint | null>(null);
    const [queryAddress, setQueryAddress] = useState<`0x${string}` | undefined>()
    
    // const { data: balance } = useBalance({
    //     address: queryAddress,
    //     // enabled: !!queryAddress // 只有queryAddress存在时才查询
    // })

    const handleSearch = async () => {
        if (!inputAddress.startsWith("0x")) {
            setError("请输入有效的ETH地址（0x开头）");
            return;
        }
        setError(null);
        try {
            const result = await getBalance(config, {
                address: inputAddress as `0x${string}`,
            });
            console.log("balance===", result)
            setBalance(result?.value); // 返回的余额是bigint类型
        } catch (err) {
            setError("查询失败: " + (err instanceof Error ? err.message : String(err)));
        } finally {
            // setIsLoading(false);
        }
    }

  return (
    <div>
      <WagmiHeader />
      <h1 className="mb-4">Wagmi Data</h1>
      <Link href="/wagmi/dashboard">进入Dashboard</Link>
      <div className='flex justify-center'>
        <Tabs defaultValue="account" className='w-200'>
            <TabsList>
                <TabsTrigger value="searchBalance">根据地址查询余额</TabsTrigger>
                <TabsTrigger value="sendETH">向某地址发送ETH</TabsTrigger>
                <TabsTrigger value="balanceOf">调用ERC-20合约balanceOf方法</TabsTrigger>
                <TabsTrigger value="listenTransfer">监听ERC-20合约Transfer事件</TabsTrigger>
                <TabsTrigger value="transfer">实现ERC20token的转账功能</TabsTrigger>
            </TabsList>
            <TabsContent value="searchBalance">
                <Card>
                    <CardHeader>
                    <CardTitle>根据地址查询余额</CardTitle>
                    <CardDescription>
                        输入一个地址，查询该地址的余额
                    </CardDescription>
                    </CardHeader>
                    <CardContent className="flex gap-3">
                        <Label htmlFor="tabs-demo-address">Address:</Label>
                        <Input value={inputAddress} onChange={(e) => setInputAddress(e.target.value.trim())} placeholder="输入ETH地址 (0x...)" />
                        <Button onClick={handleSearch}>Search</Button>
                    </CardContent>
                    <CardFooter>
                        <div className="flex gap-3">
                            显示余额：<span id="tabs-demo-balance">{balance ? formatEther(balance) : "0"}</span>
                        </div>
                    </CardFooter>
                </Card>
            </TabsContent>
            <TabsContent value="password">
            <Card>
                <CardHeader>
                <CardTitle>Password</CardTitle>
                <CardDescription>
                    Change your password here. After saving, you&apos;ll be logged
                    out.
                </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6">
                <div className="grid gap-3">
                    <Label htmlFor="tabs-demo-current">Current password</Label>
                    <Input id="tabs-demo-current" type="password" />
                </div>
                <div className="grid gap-3">
                    <Label htmlFor="tabs-demo-new">New password</Label>
                    <Input id="tabs-demo-new" type="password" />
                </div>
                </CardContent>
                <CardFooter>
                <Button>Save password</Button>
                </CardFooter>
            </Card>
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
