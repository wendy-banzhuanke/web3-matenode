'use client'

import { formatEther } from "viem";
import WalletConnectProvider from "@wendy-banzhuanke/wallet-connect-kit";
import { BrowserProvider, parseEther } from 'ethers';
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

// import WalletConnectProvider from '@wendy-banzhuanke/wallet-connect-kit';
import dynamic from 'next/dynamic'
import { useState } from "react"
import { config } from "@/utils/wagmi/config";

const WalletConnectButton = dynamic(
  () => import('@wendy-banzhuanke/wallet-connect-kit').then((mod) => {
    return mod.default.ConnectButton
  }),
  { 
    ssr: false,
    loading: () => <button>Loading Wallet...</button>
  }
)

export default function Home() {

  const { account, isConnected, provider } = WalletConnectProvider.useWallet();

  const [error, setError] = useState<string | null>(null);
  const [balance, setBalance] = useState<bigint | null>(null);
  const [inputAmount, setInputAmount] = useState("");
  const [inputToAddress, setInputToAddress] = useState("");
  const [sendETHTransactionHash, setSendETHTransactionHash] = useState<string | null>(null);

  const handleSendETH = async () => {
      if (!isConnected) {
          setError("请先连接钱包");
          return;
      }
      if (!inputToAddress.startsWith("0x")) {
          setError("请输入有效的ETH地址（0x开头）");
          return;
      }
      if (!inputAmount) {
          setError("请输入ETH数量");
          return;
      }
      setError(null);
      try {
        if(!provider) {
          setError("Provider 未初始化");
          return;
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ethersProvider = new BrowserProvider(provider as any)
        const signer = await ethersProvider.getSigner();
        const tx = await signer.sendTransaction({
          to: inputToAddress,
          value: parseEther(inputAmount)
        })
        setSendETHTransactionHash(tx.hash);
        await tx.wait();
      } catch (err) {
          setError("发送失败: " + (err instanceof Error ? err.message : String(err)));
      } finally {
      }
  }
  
  return (
    <main className='w-full'>
      <div className='h-[100px] w-full flex items-center justify-center'>
        <WalletConnectButton />
      </div>
      <div className="bg-[#4f4f4f] flex flex-col items-center justify-center min-h-screen gap-4 p-8">
        {isConnected ? (
            <Tabs defaultValue="account" className='w-200'  orientation="vertical">
            <TabsList onClick={() => {setBalance(null); setSendETHTransactionHash(null); }}>
                <TabsTrigger value="sendETH">向某地址发送ETH</TabsTrigger>
            </TabsList>
            {/* 向某地址发送ETH */}
            <TabsContent value="sendETH">
                <Card>
                    <CardHeader>
                        <CardTitle>Send ETH</CardTitle>
                        <CardDescription>
                            enter the address to send ETH
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="flex gap-3">
                            <Label htmlFor="tabs-demo-toAddress">toAddress:</Label>
                            <Input value={inputToAddress} onChange={(e) => setInputToAddress(e.target.value.trim())} placeholder="输入ETH地址 (0x...)" />
                        </div>
                        <div className="flex gap-3">
                            <Label htmlFor="tabs-demo-amount">Amount:</Label>
                            <Input value={inputAmount} onChange={(e) => setInputAmount(e.target.value.trim())} placeholder="输入ETH数量" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div>
                            <div className='mt-4 '>
                                <Button onClick={handleSendETH} className='text-center text-black bg-gray-400'>
                                    Send ETH
                                </Button>
                            </div>
                            <div className='mt-6'>
                                {sendETHTransactionHash && <p>转账成功！请在区块浏览器中<a href={`https://sepolia.etherscan.io/tx/${sendETHTransactionHash}`} target='_blank' className='text-blue-700'>查看</a></p>}
                            </div>
                        </div>
                    </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>):(
            <div>
                <p>请先连接钱包</p>
            </div>
        )
      }
      </div>
      <div className='flex justify-center mt-4'>
        {error && <div className="flex justify-center text-red-500">{error}</div>}
      </div>
    </main>
  );
}
