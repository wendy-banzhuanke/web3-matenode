import { ethers } from "ethers";
import MyToken from "../abi/MyToken.json"

export async function deployERC20Contract() {
    const provider = new ethers.JsonRpcProvider(process.env.SEPOLIA_RPC_URL);
    const signer = new ethers.Wallet(process.env.SEPOLIA_PRIVATE_KEY!, provider);

    // const factory = new ethers.ContractFactory(MyToken.abi, MyToken.bytecode, signer);
    
    // const contract = await factory.deploy("PAKEAAA", "PAKE", 18, 100);

    // await contract.waitForDeployment();

    // const contractAddress = await contract.getAddress();

    // console.log(`Contract address: ${contractAddress}`);

    return {contractAddress: "0x3Da8b4e3D12A1861930d9d691Bacbe24B2c093Fa"}//{ contractAddress }
}