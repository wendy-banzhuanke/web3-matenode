import { ethers } from "ethers";
import * as MyToken from "../artifacts/contracts/ERC20Token.sol/MyToken.json";

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner();

  console.log("Deploying contracts with the account:", await signer.getAddress());

  const MyTokenFactory = new ethers.ContractFactory(MyToken.abi, MyToken.bytecode, signer);
  const myToken = await MyTokenFactory.deploy(await signer.getAddress());

  await myToken.waitForDeployment();

  const address = await myToken.getAddress();
  console.log("MyToken deployed to:", address);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });