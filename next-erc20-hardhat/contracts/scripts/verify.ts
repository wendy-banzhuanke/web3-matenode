import "dotenv/config";
process.env.HARDHAT_NETWORK = process.env.HARDHAT_NETWORK || "sepolia";
const { default: hre } = await import("hardhat");

async function main() {
  const contractAddress = "0x3Da8b4e3D12A1861930d9d691Bacbe24B2c093Fa";
  const constructorArgs = [process.env.SEPOLIA_OWNER_ADDRESS];

  console.log("Verifying contract on Etherscan...");

  try {
    // 使用 any 类型断言，绕过类型检查
    await (hre as any).run("verify:verify", {
      address: contractAddress,
      constructorArguments: constructorArgs,
    });
    console.log("✅ Contract verified successfully!");
  } catch (err: any) {
    if (err.message.toLowerCase().includes("already verified")) {
      console.log("ℹ️ Contract already verified.");
    } else {
      console.error(err);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
