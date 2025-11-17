/*
 * @Author: zhangjian
 * @Date: 2025-11-17 11:42:43
 * @LastEditTime: 2025-11-17 15:15:09
 * @LastEditors: zhangjian
 * @Description: next - config
 */
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  allowedDevOrigins: [
    'http://localhost:3000',
    'http://10.6.30.153:3000'
  ]
};

export default nextConfig;
