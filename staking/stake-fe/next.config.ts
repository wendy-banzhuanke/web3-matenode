/*
 * @Author: zhangjian
 * @Date: 2025-11-27 15:00:56
 * @LastEditTime: 2025-11-28 15:09:49
 * @LastEditors: zhangjian
 * @Description: 配置next属性
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ['@rainbow-me/rainbowkit', 'wagmi', 'viem'],
  experimental: {
    // allowedDevOrigins: [
    //   "10.6.30.153",  // Your local dev IP
    //   "localhost"     // Default dev origin
    // ]
  }
};

export default nextConfig;
