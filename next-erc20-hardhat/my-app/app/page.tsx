'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import MyToken from './abi/MyToken.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Home() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [status, setStatus] = useState('');
  const [balance, setBalance] = useState('');
  const [networkCorrect, setNetworkCorrect] = useState(false);

  const contractAddress = '0x3Da8b4e3D12A1861930d9d691Bacbe24B2c093Fa'; // 替换成你的 Sepolia 合约地址
  const sepoliaChainId = '0xAA36A7'; // 11155111 的 hex

  // 初始化 provider & signer
  useEffect(() => {
    if (!window.ethereum) {
      setStatus('请安装 MetaMask');
      return;
    }

    const _provider = new ethers.BrowserProvider(window.ethereum);
    setProvider(_provider);

    _provider.getSigner().then(setSigner);

    checkNetwork();

    // 监听网络变化
    window.ethereum.on('chainChanged', () => {
      window.location.reload();
    });
  }, []);

  // 检查并切换网络
  const checkNetwork = async () => {
    try {
      const chainId: string = await window.ethereum.request({ method: 'eth_chainId' });
      if (chainId === sepoliaChainId) {
        setNetworkCorrect(true);
        setStatus('网络正确: Sepolia');
      } else {
        setNetworkCorrect(false);
        setStatus('网络不对，正在尝试切换到 Sepolia...');
        await switchToSepolia();
      }
    } catch (err) {
      console.error(err);
      setStatus('检查网络失败');
    }
  };

  // 请求切换到 Sepolia
  const switchToSepolia = async () => {
    if (!window.ethereum) return;
    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: sepoliaChainId }],
      });
      setNetworkCorrect(true);
      setStatus('已切换到 Sepolia');
    } catch (switchError: any) {
      // 如果 MetaMask 没有这个网络，需要先添加
      if (switchError.code === 4902) {
        try {
          await window.ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: sepoliaChainId,
                chainName: 'Sepolia Test Network',
                rpcUrls: ['https://sepolia.infura.io/v3/你的INFURA_KEY'], // 替换成你自己的 RPC
                nativeCurrency: {
                  name: 'SepoliaETH',
                  symbol: 'ETH',
                  decimals: 18,
                },
                blockExplorerUrls: ['https://sepolia.etherscan.io'],
              },
            ],
          });
          setNetworkCorrect(true);
          setStatus('已添加并切换到 Sepolia');
        } catch (addError) {
          console.error(addError);
          setStatus('添加 Sepolia 网络失败');
        }
      } else {
        console.error(switchError);
        setStatus('切换 Sepolia 网络失败');
      }
    }
  };

  // 请求用户连接钱包
  const connectWallet = async () => {
    if (!window.ethereum) return setStatus('请安装 MetaMask');
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const _provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(_provider);
      setSigner(await _provider.getSigner());
      setStatus('钱包已连接');
      checkNetwork(); // 连接钱包后检查网络
    } catch (err) {
      console.error(err);
      setStatus('连接钱包失败');
    }
  };

  // Mint 代币
  const handleMint = async () => {
    if (!signer) return setStatus('Signer 未准备好');
    if (!networkCorrect) return setStatus('请切换到 Sepolia 网络');

    try {
      const contract = new ethers.Contract(contractAddress, MyToken.abi, signer);
      const addr = await signer.getAddress();
      setStatus('正在 Mint 代币...');
      const tx = await contract.mint(addr, ethers.parseEther('100'));
      await tx.wait();
      setStatus('Mint 成功！');
    } catch (err) {
      console.error(err);
      setStatus('Mint 失败');
    }
  };

  // 查询余额
  const handleBalance = async () => {
    if (!provider || !signer) return setStatus('Provider 或 Signer 未准备好');
    if (!networkCorrect) return setStatus('请切换到 Sepolia 网络');

    try {
      const contract = new ethers.Contract(contractAddress, MyToken.abi, provider);
      const addr = await signer.getAddress();
      setStatus('查询余额中...');
      const b = await contract.balanceOf(addr);
      setBalance(ethers.formatEther(b));
      setStatus('查询成功');
    } catch (err) {
      console.error(err);
      setStatus('查询余额失败');
    }
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      {!signer && (
        <button onClick={connectWallet} className="px-4 py-2 border rounded">
          连接钱包
        </button>
      )}

      {signer && (
        <>
          <button
            onClick={handleMint}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Mint 100 代币
          </button>

          <button
            onClick={handleBalance}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            查询余额
          </button>

          {balance && <p>您的余额: {balance} DUOLIAAA</p>}
        </>
      )}

      {status && <p className="mt-4 text-red-500">{status}</p>}
    </main>
  );
}
