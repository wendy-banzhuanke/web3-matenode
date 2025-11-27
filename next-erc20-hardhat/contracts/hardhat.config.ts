/*
 * @Author: zhangjian
 * @Date: 2025-11-18 14:28:55
 * @LastEditTime: 2025-11-26 11:30:22
 * @LastEditors: zhangjian
 * @Description: hardhat 配置文件
 */
import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";
import "@nomicfoundation/hardhat-verify";
import "dotenv/config";

// Sepolia 私钥
const sepoliaAccounts = process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [];

// Hardhat 3 TS 配置：使用类型扩展解决 etherscan 报错
const config: HardhatUserConfig & { etherscan?: { apiKey?: string } } = {
  solidity: "0.8.24",
  networks: {
    hardhat: {
      type: "edr-simulated", // Hardhat 3 新版本模拟网络
      chainId: 31337,
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
        accountsBalance: "10000000000000000000000", // 10000 ETH
      },
    },

    sepolia: {
      type: "http",
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: sepoliaAccounts,
      chainId: 11155111,
    },
  },

  // 使用类型扩展，避免 TS 报错
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};

export default config;
