/*
 * @Author: zhangjian
 * @Date: 2025-11-17 14:00:57
 * @LastEditTime: 2025-11-17 15:51:35
 * @LastEditors: zhangjian
 * @Description: Simple ERC20部署工具（支持Sepolia和本地部署）
 */
"use client"; // 添加这一行，标记为客户端组件

import { useState } from 'react'
import { ethers } from 'ethers';
import SimpleTokenArtifact from '../../contracts/simple/SimpleToken.json';

// 扩展 Window 接口
declare global {
  interface Window {
    ethereum?: ethers.Eip1193Provider;
  }
}

export default function SimpleToken() {
  const [contractAddress, setContractAddress] = useState('');
  const [isLoading, setIsLoading] = useState(false)
  const [isLocalNetwork, setIsLocalNetwork] = useState(false);

  const deployToSepolia = async () =>   {
    if (!window.ethereum) {
      alert('请安装 MetaMask 并切换到 Sepolia 测试网！');
      return;
    }
    
    setIsLoading(true)
    setIsLocalNetwork(false)

    try {
      // 1. 连接钱包
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      // 2. 检查网络是否为 Sepolia (链ID: 11155111)
      const network = await provider.getNetwork();
      if (Number(network.chainId) !== 11155111) {
        throw new Error('请切换到 Sepolia 测试网');
      }
      // 3. 部署合约
      const factory = new ethers.ContractFactory(
        SimpleTokenArtifact.abi,
        SimpleTokenArtifact.bytecode || SimpleTokenArtifact.evm?.bytecode?.object,
        signer
      );
      const contract = await factory.deploy(ethers.parseEther("1000"));
      await contract.waitForDeployment();
      setContractAddress(await contract.getAddress());
      
    } catch (error) {
      console.error(error);
      alert(`部署失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }

  const deployToLocal = async () =>   { 
    setIsLoading(true);
    setIsLocalNetwork(true);

    try { 
      // 连接到本地开发节点（默认Hardhat/Ganache端口）
      const provider = new ethers.JsonRpcProvider("http://localhost:8545");

      // 获取第一个测试账户（本地节点通常预充值ETH）
      const signer = await provider.getSigner(0);
      console.log("使用本地账户:", await signer.getAddress());
      const factory = new ethers.ContractFactory(
        SimpleTokenArtifact.abi,
        SimpleTokenArtifact.bytecode,
        signer
      );
      console.log("开始部署到本地网络...");
      const contract = await factory.deploy(ethers.parseEther("1000"));
      await contract.waitForDeployment();

      const address = await contract.getAddress();
      setContractAddress(address);
      console.log("本地部署成功!", address);
      
    } catch (error) {
      console.error(error);
      alert(`部署失败: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setIsLoading(false);
    }
  }

  return(
    <div style={{ padding: '20px' }}>
      <h1>Sepolia ERC20 部署工具</h1>
      <div>
        <button
          onClick={deployToSepolia}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoading ? '#ccc' : '#4CAF50',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isLoading?'部署中...':'部署到sepolia'}
        </button>
      </div>
      <div>
        <button
          onClick={deployToLocal}
          disabled={isLoading}
          style={{
            padding: '10px 20px',
            backgroundColor: isLoading ? '#ccc' : '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          {isLoading?'部署中...':'部署到local'}
        </button>
      </div>
      {
        contractAddress && (
          <div>
            <h2>部署成功！</h2>
            <p>合约地址: {contractAddress}</p>
            {isLocalNetwork ? (
              <p>本地合约已部署，请使用Hardhat或Ganache控制台交互</p>
            ) : (
              <a
                href={`https://sepolia.etherscan.io/address/${contractAddress}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#2196F3' }}
              >
                在 Etherscan 查看
              </a>
            )}
          </div>
        )
      }
    </div>
  )
}