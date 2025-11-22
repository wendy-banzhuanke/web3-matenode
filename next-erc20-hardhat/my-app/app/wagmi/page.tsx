'use client';

import {  useState } from 'react'
import Link from 'next/link';
import { useSendTransaction, useConnection, useWriteContract, useWaitForTransactionReceipt} from 'wagmi'
import { getBalance, readContract } from '@wagmi/core'
import { sepolia } from '@wagmi/core/chains'
import { formatEther, parseEther } from "viem";
import MyTokenABI from "../../abi/MyToken.json";
import { config } from "@/utils/wagmi/config";
import WagmiHeader from "@/components/wagmi/header";
import Alert from "@/components/wagmi/alert";
import TransferList from "@/components/wagmi/transfer-table";
import useTransferListeners from "@/hooks/transfer-listeners";
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
    const { sendTransaction } = useSendTransaction()
    const { address } = useConnection()
    const { writeContract,data: hash, isPending, error: submitError, reset } = useWriteContract()
    const { isLoading: isConfirming, isSuccess: isConfirmed, error: confirmError } = useWaitForTransactionReceipt({ hash })

    const [inputAddress, setInputAddress] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [balance, setBalance] = useState<bigint | null>(null);

    const [inputAmount, setInputAmount] = useState("");
    const [inputToAddress, setInputToAddress] = useState("");

    const [inputContractAddress, setInputContractAddress] = useState("");
    const [inputOwnerAddress, setInputOwnerAddress] = useState("");

    const [transferContractAddress, setTransferContractAddress] = useState("");
    const [receiveAddress, setReceiveAddress] = useState("");
    const [transferAmount, setTransferAmount] = useState("");

    useTransferListeners(!!transferContractAddress ? transferContractAddress as `0x${string}` : (process.env.NEXT_PUBLIC_DEFAULT_CONTRACT_ADDRESS as `0x${string}`))
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
            console.log("handleSearch===", result)
            setBalance(result?.value); 
        } catch (err) {
            setError("查询失败: " + (err instanceof Error ? err.message : String(err)));
        } finally {
        }
    }

    const handleSendETH = async () => {
        if (!address) {
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
            console.log("sepolia.id", sepolia, sepolia.id)
            const result = sendTransaction({
                chainId: sepolia.id,
                to: inputToAddress as `0x${string}`,
                value: parseEther(inputAmount),
                gas: BigInt(300000), // Sepolia 基础Gas Limit
            })
            console.log("handleSendETH result===", result)
            // setError("发送成功: " + result);
        } catch (err) {
            setError("发送失败: " + (err instanceof Error ? err.message : String(err)));
        } finally {
        }
    }

    const handleERC20ContractBalanceOfSearch = async () => {
        if (!inputContractAddress.startsWith("0x")) {
            setError("请输入有效的ETH地址（0x开头）");
            return;
        }
        setError(null);
        try {
            const result = await readContract(config, {
                abi: MyTokenABI.abi,
                address: inputContractAddress as `0x${string}`,
                functionName: 'balanceOf',
                args: [inputOwnerAddress ? (inputOwnerAddress as `0x${string}`) : address], 
            })
            console.log("handleERC20ContractBalanceOfSearch===", result)
            setBalance(BigInt(result as string)); 
        } catch (err) {
            setError("查询失败: " + (err instanceof Error ? err.message : String(err)));
        } finally {
        }
    }

    const handleTransfer = async () => {
        if (!address) {
            setError("请先连接钱包");
            return;
        }
        if (!transferContractAddress.startsWith("0x")) {
            setError("请输入有效的ETH地址（0x开头）");
            return;
        }
        if (!receiveAddress.startsWith("0x")) {
            setError("请输入有效的ETH地址（0x开头）");
            return;
        }
        if (!transferAmount) {
            setError("请输入转账金额");
            return;
        }
        setError(null);
        try {
            await writeContract({
                abi: MyTokenABI.abi,
                address: transferContractAddress as `0x${string}`,
                functionName: 'transfer',
                args: [receiveAddress as `0x${string}`, parseEther(transferAmount)], 
            }, {
                onSuccess: (hash) => {
                    console.log('交易已提交，哈希:', hash)
                },
                onError: (error) => {
                    console.error('提交错误:', error.message)
                    reset()
                },
            })
        } catch (err) {
            setError("转账失败: " + (err instanceof Error ? err.message : String(err)));
        } finally {

        }
    }

  return (
    <div>
      <WagmiHeader />
      {/* <h1 className="mb-4">Wagmi Data</h1> */}
      {/* <Link href="/wagmi/dashboard">进入Dashboard</Link> */}
      <div className='flex justify-center mt-4'>
        <Tabs defaultValue="account" className='w-200'  orientation="vertical">
            <TabsList onClick={() => setBalance(null)}>
                <TabsTrigger value="searchBalance">根据地址查询余额</TabsTrigger>
                <TabsTrigger value="sendETH">向某地址发送ETH</TabsTrigger>
                <TabsTrigger value="balanceOf">调用ERC-20合约balanceOf方法</TabsTrigger>
                <TabsTrigger value="listenTransfer">监听ERC-20合约Transfer事件</TabsTrigger>
                <TabsTrigger value="transfer">实现ERC20token的转账功能</TabsTrigger>
            </TabsList>
            {/* 根据地址查询余额 */}
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
                        <Button onClick={handleSendETH}>Send ETH</Button>
                    </CardFooter>
                </Card>
            </TabsContent>
            {/* 调用ERC-20合约balanceOf方法 */}
            <TabsContent value="balanceOf">
                <Card>
                    <CardHeader>
                        <CardTitle>调用ERC-20合约balanceOf方法</CardTitle>
                        <CardDescription>
                            输入一个地址，查询该地址在合约中的余额
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="flex">
                            <Label htmlFor="tabs-demo-address" className='w-50'>Token Address:</Label>
                            <Input value={inputContractAddress} onChange={(e) => setInputContractAddress(e.target.value.trim())} placeholder="输入ETH地址 (0x...)" />
                        </div>
                        <div className="flex">
                            <Label htmlFor="tabs-demo-ownerAddress" className='w-50'>Owner Address: (default msg.sender)</Label>
                            <Input value={inputOwnerAddress} onChange={(e) => setInputOwnerAddress(e.target.value.trim())} placeholder="输入ETH地址 (0x...)" />
                        </div>
                        <div>
                            <Button onClick={handleERC20ContractBalanceOfSearch}>Search Balance</Button>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <div className="flex gap-3 mt-4">
                            显示数量：<span id="tabs-demo-balance">{balance ? formatEther(balance) : "0"}</span>
                        </div>
                    </CardFooter>
                </Card>
            </TabsContent>
            {/* 监听ERC-20合约Transfer事件 */}
            <TabsContent value="listenTransfer">
                <TransferList />
            </TabsContent>
            {/* 实现ERC20token的转账功能 */}
            <TabsContent value="transfer">
                <Card>
                    <CardHeader>
                        <CardTitle>实现ERC20token的转账功能</CardTitle>
                        <CardDescription>
                            ERC20token 转账到指定地址
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="grid gap-6">
                        <div className="flex gap-3">
                            <Label htmlFor="tabs-demo-toAddress" className='w-50'>Contract Address:</Label>
                            <Input value={transferContractAddress} onChange={(e) => setTransferContractAddress(e.target.value.trim())} placeholder="输入ETH地址 (0x...)" />
                        </div>
                        <div className="flex gap-3">
                            <Label htmlFor="tabs-demo-amount" className='w-50'>Receive Address:</Label>
                            <Input value={receiveAddress} onChange={(e) => setReceiveAddress(e.target.value.trim())} placeholder="输入ETH地址 (0x...)" />
                        </div>
                        <div className="flex gap-3">
                            <Label htmlFor="tabs-demo-amount" className='w-50'>Transfer Amount:</Label>
                            <Input value={transferAmount} onChange={(e) => setTransferAmount(e.target.value.trim())} placeholder="输入ETH数量" />
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={handleTransfer} disabled={isPending || isConfirming}>
                            {isPending ? '等待钱包确认...' : isConfirming ? '交易确认中...' : 'Transfer'}
                        </Button>
                    </CardFooter>
                </Card>
            </TabsContent>
        </Tabs>
      </div>
       <div className='flex justify-center mt-4'>
        {error && <div className="flex justify-center text-red-500">{error}</div>}
        {!error && (isConfirmed || submitError || confirmError) && <Alert content={ isConfirmed ? '转账成功' : submitError || confirmError ? '转账失败' : '21231' } status={isConfirmed ? 'success' : 'error'} />}
       </div>
    </div>
  );
}
