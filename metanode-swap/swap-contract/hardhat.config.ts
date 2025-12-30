/*
 * @Author: zhangjian
 * @Date: 2025-12-23 09:35:54
 * @LastEditTime: 2025-12-30 14:40:40
 * @LastEditors: zhangjian
 * @Description: 描述
 */
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";
import "dotenv/config";


const sepoliaAccounts = process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [];

export default defineConfig({
  paths: {
    // 添加 pnpm 的存储路径
    sources: "./contracts",
    cache: "./cache",
    artifacts: "./artifacts"
  },
  plugins: [hardhatToolboxViemPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
        settings: {
          viaIR: true,      // ✅ 启用 IR 编译
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      production: {
        version: "0.8.28",
        settings: {
          viaIR: true,      // ✅ 启用 IR 编译
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545",
      chainId: 31337,  // Hardhat 本地网络的默认 chainId
      type: "http",     // 声明这是一个 HTTP 网络
      accounts: {
        mnemonic: "test test test test test test test test test test test junk",
      },
    },
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    // sepolia: {
    //   type: "http",
    //   chainType: "l1",
    //   url: configVariable("SEPOLIA_RPC_URL"),
    //   accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    // },
    sepolia: {
      type: "http",
      chainId: 11155111,
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: sepoliaAccounts,
    },
  },
});
