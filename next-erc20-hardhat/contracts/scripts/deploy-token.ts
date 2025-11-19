import { ethers } from "ethers";
import * as MyToken from "../artifacts/contracts/ERC20Token.sol/MyToken.json";

async function main() {
  const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");
  const signer = await provider.getSigner();

  const signerAddress = await signer.getAddress();
  if (signerAddress.toLowerCase() === '0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266') {
    throw new Error('Cannot deploy with the default test account. Please configure your private key.');
  }

  console.log("Deploying contracts with the account:", signerAddress);

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