/*
 * @Author: zhangjian
 * @Date: 2025-11-27 15:00:56
 * @LastEditTime: 2025-11-27 16:34:39
 * @LastEditors: zhangjian
 * @Description: 配置next属性
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // allowedDevOrigins: [
    //   "10.6.30.153",  // Your local dev IP
    //   "localhost"     // Default dev origin
    // ]
  }
};

export default nextConfig;
