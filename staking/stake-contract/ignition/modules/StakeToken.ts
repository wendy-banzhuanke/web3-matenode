import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ERC20ParkTokenModule from "./ERC20ParkToken.sol";

export default buildModule("StakeTokenModule", (m) => {
  // 1. 获取参数
  // TokenModule#ParkToken - 0x5FbDB2315678afecb367f032d93F642f64180aa3
// ERC20ParkTokenModule#ParkToken - 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
  const parkToken = "0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512";// m.useModule(ERC20ParkTokenModule).parkToken; // ✅ 使用模块依赖
  const startBlock = m.getParameter("startBlock", 100n);
  const endBlock = m.getParameter("endBlock", 1000100n);
  const parkPerBlock = m.getParameter("parkPerBlock", 10n * 10n ** 18n);

  // 2. 部署主合约
  const stakeToken = m.contract("StakeToken");

  // 3. 初始化基础参数
  m.call(stakeToken, "initialize", [
    parkToken,
    startBlock,
    endBlock,
    parkPerBlock
  ]);

  // 4. 初始化ETH池 (pid=0)
  m.call(stakeToken, "addPool", [
    "0x0000000000000000000000000000000000000000", // ETH池地址必须为零
    1000n,                                        // 初始权重 (建议设为总权重的70%~80%)
    1n * 10n ** 16n,                              // 最小质押0.01 ETH (以wei为单位)
    50n,                                         // 锁定约10分钟 (假设区块间隔12秒)
    false                                         // 不触发massUpdatePools
  ],{
    id: "initETHPool" // 唯一ID
  });
  // 5. 可选：初始化ERC20池示例（如Park代币池）
  m.call(stakeToken, "addPool", [
    parkToken,       // Park代币地址
    200n,            // 权重
    1n * 10n ** 18n, // 最小质押1 PARK (假设精度18)
    1800n,           // 锁定约6小时
    true             // 触发massUpdatePools更新奖励
  ], {
    id: "initParkPool" // 唯一ID 
  });

  return { stakeToken };
});
