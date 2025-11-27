/*
 * @Author: zhangjian
 * @Date: 2025-11-26 09:02:00
 * @LastEditTime: 2025-11-26 11:32:14
 * @LastEditors: zhangjian
 * @Description: hardhat配置
 */
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";
import "dotenv/config";

const sepoliaAccounts = process.env.SEPOLIA_PRIVATE_KEY ? [process.env.SEPOLIA_PRIVATE_KEY] : [];

export default defineConfig({
  plugins: [hardhatToolboxViemPlugin],
  // paths: {
  //   tests: {
  //     nodejs: "./paths/to/your/tests",
  //   },
  // },
  solidity: {
    profiles: {
      default: {
        version: "0.8.28",
      },
      production: {
        version: "0.8.28",
        settings: {
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
