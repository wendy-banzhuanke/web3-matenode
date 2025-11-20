'use client';

import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import MyToken from '../../abi/MyToken.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function ERC20() {
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [signer, setSigner] = useState<ethers.JsonRpcSigner | null>(null);
  const [status, setStatus] = useState('');
  const [balance, setBalance] = useState('');
  const [networkCorrect, setNetworkCorrect] = useState(false);
  const [currentChainId, setCurrentChainId] = useState('');
  const [contractAddress, setContractAddress] = useState('');
  const [mintAmount, setMintAmount] = useState('');

  // const contractAddress = '0x3Da8b4e3D12A1861930d9d691Bacbe24B2c093Fa'; // 替换成你的 Sepolia 合约地址
  const sepoliaChainId = '0xAA36A7'; // 11155111 的 hex

  // 检查网络
  const handleCheckNetwork = async () => {
    try {
      setStatus('正在检查当前网络...');
      const chainId: string = await window.ethereum.request({ method: 'eth_chainId' });
      setCurrentChainId(chainId);
      if (chainId.toLowerCase() === sepoliaChainId.toLowerCase()) {
        setNetworkCorrect(true);
        setStatus('当前网络: Sepolia');
      } else {
        setNetworkCorrect(false);
        const network = await provider?.getNetwork();
        setStatus(`当前网络: ${networkCorrect ? 'Sepolia' : '其他网络'}，chainId: ${network?.chainId}`);
      }
    } catch (err) {
      console.error(err);
      setStatus('检查网络失败');
    }
  };
  // 切换网络
  const handleSwitchNetwork = async () => {
    try {
      setStatus('正在尝试切换到 Sepolia...');
      await switchToSepolia();
    } catch (err) {
      console.error(err);
      setStatus('切换网络失败');
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
      // if (switchError.code === 4902) {
      //   try {
      //     await window.ethereum.request({
      //       method: 'wallet_addEthereumChain',
      //       params: [
      //         {
      //           chainId: sepoliaChainId,
      //           chainName: 'Sepolia Test Network',
      //           rpcUrls: ['https://sepolia.infura.io/v3/你的INFURA_KEY'], // 替换成你自己的 RPC
      //           nativeCurrency: {
      //             name: 'SepoliaETH',
      //             symbol: 'ETH',
      //             decimals: 18,
      //           },
      //           blockExplorerUrls: ['https://sepolia.etherscan.io'],
      //         },
      //       ],
      //     });
      //     setNetworkCorrect(true);
      //     setStatus('已添加并切换到 Sepolia');
      //   } catch (addError) {
      //     console.error(addError);
      //     setStatus('添加 Sepolia 网络失败');
      //   }
      // } else {
      //   console.error(switchError);
      //   setStatus('切换 Sepolia 网络失败');
      // }
    }
  };

  // 部署ERC20合约
  const handleDeployERC20Contract = async () => {
    try {
      setStatus('部署中...');
      const response = await fetch("/api/deploy", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      console.log("response", response);
      const data = await response.json();
      setContractAddress(data.contractAddress);
      setStatus(`部署成功, 合约地址: ${data.contractAddress}`);
    } catch (error) {
      console.log(error);
      setStatus('部署失败');
    }
  }

  // 请求用户连接钱包
  const connectWallet = async () => {
    if (!window.ethereum) return setStatus('请安装 MetaMask');
    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const _provider = new ethers.BrowserProvider(window.ethereum);
      setProvider(_provider);
      setSigner(await _provider.getSigner());
      setStatus('钱包已连接');
      handleCheckNetwork(); // 连接钱包后检查网络
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
      setStatus(`正在 Mint 代币...数量: ${mintAmount}`);
      const tx = await contract.mint(addr, ethers.parseEther(mintAmount));
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

  // 初始化 provider & signer
  useEffect(() => {
    if (!window.ethereum) {
      queueMicrotask(() => setStatus('请安装 MetaMask'));
      return;
    }

    const init = async () => {
      try {
        const _provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(_provider);
        const _signer = await _provider.getSigner();
        setSigner(_signer);
      } catch (err) {
        setStatus('MetaMask 连接失败'); // 在异步上下文中调用
        console.log("err:" + err);
      }
    };
    init();

    // checkNetwork();

    // 监听网络变化
    const handleChainChanged = () => window.location.reload();
    window.ethereum.on('chainChanged', handleChainChanged);
    return () => {
      window.ethereum?.removeListener('chainChanged', handleChainChanged);
    };
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      {!signer && (
        <button onClick={connectWallet} className="px-4 py-2 border rounded my-4">
          连接钱包
        </button>
      )}

      {signer && (
        <>
          <button
            onClick={handleCheckNetwork}
            className="px-4 py-2 border rounded hover:bg-gray-100 cursor-pointer my-4"
          >
            检查当前网络
          </button>

          {(!networkCorrect && currentChainId && currentChainId !== sepoliaChainId) && (
            <button
              onClick={handleSwitchNetwork}
              className="px-4 py-2 border rounded hover:bg-gray-100 my-4"
            >
              切换网络到 Sepolia
            </button>
          )}

          {networkCorrect && (
            <button
              onClick={handleDeployERC20Contract}
              className="px-4 py-2 border rounded hover:bg-gray-100 my-4"
            >
              部署ERC20合约
            </button>
          )}

          {contractAddress && (
            <>
              <div className='flex items-center gap-2 border border-red-400 rounded px-4 py-2 my-4'>
                <label>Mint Token：</label>
                <input value={mintAmount} onChange={(e) => setMintAmount(e.target.value)} className='border rounded px-2 py-1' placeholder="请输入铸造数量" />
                <button
                  disabled={!networkCorrect}
                  onClick={handleMint}
                  className="px-2 py-1 border border-gray-400 rounded hover:bg-gray-100 cursor-pointer"
                >
                  Confirm Mint
                </button>
              </div>

              <button
                disabled={!networkCorrect}
                onClick={handleBalance}
                className="px-4 py-2 border rounded hover:bg-gray-100 my-4"
              >
                查询余额
              </button>
            </>
          )}

          {balance && <p>您的余额: {balance} DUOLIAAA</p>}
        </>
      )}

      {status && <p className="mt-4 text-red-500">{status}</p>}
    </main>
  );
}
