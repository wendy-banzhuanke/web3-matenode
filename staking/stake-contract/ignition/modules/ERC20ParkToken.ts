import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("ERC20ParkTokenModule", (m) => {
  // 使用第一个账户作为初始 owner
  const owner = m.getAccount(0);

  // 部署 MyToken 合约，传入 owner 作为构造函数参数
  const token = m.contract("ParkToken", [owner]);
  console.log("ERC20Token deployed to:", owner);
  return { token };
});
