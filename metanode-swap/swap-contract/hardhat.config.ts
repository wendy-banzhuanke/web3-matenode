/*
 * @Author: zhangjian
 * @Date: 2025-12-23 09:35:54
 * @LastEditTime: 2025-12-28 21:35:00
 * @LastEditors: zhangjian
 * @Description: 描述
 */
import hardhatToolboxViemPlugin from "@nomicfoundation/hardhat-toolbox-viem";
import { configVariable, defineConfig } from "hardhat/config";
import path from "path";
require("@nomicfoundation/hardhat-toolbox");

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
    hardhatMainnet: {
      type: "edr-simulated",
      chainType: "l1",
    },
    hardhatOp: {
      type: "edr-simulated",
      chainType: "op",
    },
    sepolia: {
      type: "http",
      chainType: "l1",
      url: configVariable("SEPOLIA_RPC_URL"),
      accounts: [configVariable("SEPOLIA_PRIVATE_KEY")],
    },
  },
});
