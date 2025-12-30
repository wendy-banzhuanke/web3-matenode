import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MetaNodeSwapModule = buildModule("MetaNodeSwapModule", (m) => {
  // 1. Deploy PoolManager
  const poolManager = m.contract("PoolManager");

  // 2. Deploy SwapRouter, passing PoolManager address
  const swapRouter = m.contract("SwapRouter", [poolManager]);

  // 3. Deploy PositionManager, passing PoolManager address
  const positionManager = m.contract("PositionManager", [poolManager]);

  return { poolManager, swapRouter, positionManager };
});

export default MetaNodeSwapModule;
