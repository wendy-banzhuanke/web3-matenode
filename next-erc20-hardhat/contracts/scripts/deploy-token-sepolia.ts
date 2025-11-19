import hre from "hardhat";
import * as MyTokenJson from "../artifacts/contracts/ERC20Token.sol/MyToken.json";


async function main() {
  console.log("Starting deployment to Sepolia...");

  const [deployer] = await hre.ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);

  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("Account balance:", hre.ethers.formatEther(balance), "ETH");

  if (balance === 0n) {
    throw new Error("The deployment account has no ETH. Please fund the account at " + deployer.address + " before deploying.");
  }

  const MyTokenFactory = await hre.ethers.getContractFactory("MyToken");
  console.log("Deploying MyToken...");
  const myToken = await MyTokenFactory.deploy(deployer.address);

  await myToken.waitForDeployment();

  const address = await myToken.getAddress();
  console.log("\n🎉 MyToken deployed successfully! 🎉");
  console.log("Contract address:", address);
  console.log(`\nVerify on Sepolia Etherscan: https://sepolia.etherscan.io/address/${address}`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });