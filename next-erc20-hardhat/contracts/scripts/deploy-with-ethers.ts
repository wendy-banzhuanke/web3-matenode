import { ethers } from "ethers";
import "dotenv/config";
import * as MyTokenJson from "../artifacts/contracts/ERC20Token.sol/MyToken.json";

async function main() {
  const { SEPOLIA_RPC_URL, SEPOLIA_PRIVATE_KEY } = process.env;

  if (!SEPOLIA_RPC_URL || !SEPOLIA_PRIVATE_KEY) {
    throw new Error("Missing SEPOLIA_RPC_URL or SEPOLIA_PRIVATE_KEY in .env file");
  }

  const provider = new ethers.JsonRpcProvider(SEPOLIA_RPC_URL);
  const wallet = new ethers.Wallet(SEPOLIA_PRIVATE_KEY, provider);

  console.log(`Attempting to deploy from account: ${wallet.address}`);

  const balance = await provider.getBalance(wallet.address);
  console.log(`Account balance: ${ethers.formatEther(balance)} ETH`);

  if (balance === 0n) {
    throw new Error("The deployment account has no ETH. Please fund the account before deploying.");
  }

  const myTokenFactory = new ethers.ContractFactory(MyTokenJson.abi, MyTokenJson.bytecode, wallet);

  console.log("Deploying MyToken...");
  const myToken = await myTokenFactory.deploy(wallet.address);

  await myToken.waitForDeployment();

  const address = await myToken.getAddress();

  console.log("\n🎉 MyToken deployed successfully! 🎉");
  console.log(`Contract address: ${address}`);
  console.log(`\nVerify on Sepolia Etherscan: https://sepolia.etherscan.io/address/${address}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});