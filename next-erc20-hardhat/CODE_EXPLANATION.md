# ERC20 代币项目代码说明文档

你好！欢迎阅读这份代码说明文档。本文档旨在逐行解释我们在此项目中编写的关键代码，帮助你理解从创建智能合约到通过Web前端与之交互的整个流程。

## 1. 智能合约: `contracts/contracts/ERC20Token.sol`

这是我们项目的核心，一个标准的ERC20代币合约。我们使用了业界公认最安全的[OpenZeppelin](https://www.openzeppelin.com/contracts)合约库来构建它，这极大地提高了合约的安全性与可靠性。

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MyToken is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("MyToken", "MTK")
        Ownable(initialOwner)
    {}

    function mint(address to, uint256 amount) public onlyOwner {
        _mint(to, amount);
    }
}
```

### 代码逐行解释:

- **`// SPDX-License-Identifier: MIT`**: 这是一个标准的注释，用于声明代码所使用的软件许可证。`MIT` 是一个非常宽松的开源许可证。这是Solidity的最佳实践。

- **`pragma solidity ^0.8.24;`**: 这行代码指定了我们的合约所兼容的Solidity编译器版本。`^` 符号表示我们的代码可以在 `0.8.24` 及以上，但在 `0.9.0` 以下的编译器版本上运行。

- **`import "@openzeppelin/contracts/token/ERC20/ERC20.sol";`**: 我们从OpenZeppelin库中导入了 `ERC20.sol` 合约。这个合约已经为我们实现了ERC20标准的所有核心功能，例如 `transfer()`, `approve()`, `balanceOf()` 等。

- **`import "@openzeppelin/contracts/access/Ownable.sol";`**: 我们还导入了 `Ownable.sol` 合约。这是一个访问控制模块，它为我们的合约引入了“所有者”的概念。只有合约的“所有者”才能执行某些特权操作。

- **`contract MyToken is ERC20, Ownable { ... }`**: 这里我们定义了我们的合约 `MyToken`。通过 `is ERC20, Ownable`，我们的合约继承了 `ERC20` 和 `Ownable` 两个父合约的所有功能。

- **`constructor(address initialOwner) ERC20("MyToken", "MTK") Ownable(initialOwner) {}`**: 这是合约的构造函数。当合约被部署到区块链上时，它会自动执行一次。
    - `ERC20("MyToken", "MTK")`: 我们调用了父合约 `ERC20` 的构造函数，并设置了我们代币的名称（"MyToken"）和符号（"MTK"）。
    - `Ownable(initialOwner)`: 我们调用了父合约 `Ownable` 的构造函数，并将 `initialOwner` 这个地址设置为合约的初始所有者。在我们的部署脚本中，这个地址就是部署者的地址。

- **`function mint(address to, uint256 amount) public onlyOwner { ... }`**: 这是我们自己添加的一个函数，名为 `mint`（铸造）。
    - `public`: 表示这个函数可以从外部被调用。
    - `onlyOwner`: 这是一个来自 `Ownable` 合约的修饰符。它确保了只有合约的“所有者”才能成功调用这个函数。如果其他人尝试调用，交易将会失败。
    - `_mint(to, amount);`: 我们调用了 `ERC20` 合约内部的 `_mint` 函数。这个函数会凭空创造出 `amount` 数量的代币，并将它们发送到 `to` 这个地址。

---

## 2. Hardhat 配置: `contracts/hardhat.config.ts`

这个文件用于配置我们的Hardhat开发环境。

```typescript
import hardhatToolboxMochaEthersPlugin from "@nomicfoundation/hardhat-toolbox-mocha-ethers";
import { defineConfig } from "hardhat/config";

export default defineConfig({
  plugins: [hardhatToolboxMochaEthersPlugin],
  solidity: {
    profiles: {
      default: {
        version: "0.8.24",
      },
      // ...
    },
  },
  networks: {
    localhost: {
      url: "http://127.0.0.1:8545"
    },
  },
});
```

### 代码逐行解释:

- **`solidity: { ... }`**: 这个部分定义了Solidity编译器的相关配置。
    - `version: "0.8.24"`: 我们将编译器的版本设置为 `0.8.24`，以匹配我们合约中 `pragma` 声明的版本。

- **`networks: { ... }`**: 这个部分用于定义我们可以将合约部署到的不同区块链网络。
    - `localhost`: 我们定义了一个名为 `localhost` 的网络。
    - `url: "http://127.0.0.1:8545"`: 我们将这个网络的URL指向 `http://127.0.0.1:8545`。这是Hardhat本地测试节点默认运行的地址。

---

## 3. 部署脚本: `contracts/scripts/deploy-token.ts`

这个脚本负责将我们的 `MyToken` 合约部署到指定的网络。

```typescript
import { ethers } from "ethers";
import MyToken from "../artifacts/contracts/ERC20Token.sol/MyToken.json";

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
  .then(() =\u003e process.exit(0))
  .catch((error) =\u003e {
    console.error(error);
    process.exit(1);
  });
```

### 代码逐行解释:

- **`import { ethers } from "ethers";`**: 我们从 `ethers` 库中导入了 `ethers` 对象。`ethers.js` 是一个非常流行的库，用于与以太坊区块链进行交互。

- **`import MyToken from "../artifacts/contracts/ERC20Token.sol/MyToken.json";`**: 我们导入了 `MyToken.json` 文件。这个文件是在我们编译合约时由Hardhat自动生成的，它包含了合约的ABI（应用二进制接口）和字节码（bytecode）。
    - **ABI**: 描述了合约的接口，告诉我们合约有哪些函数可以调用。
    - **Bytecode**: 合约被编译后的机器码，是实际部署到区块链上的内容。

- **`const provider = new ethers.JsonRpcProvider("http://127.0.0.1:8545");`**: 我们创建了一个 `JsonRpcProvider` 实例，将它连接到我们的本地Hardhat节点。`Provider` 负责与区块链进行通信。

- **`const signer = await provider.getSigner();`**: 我们从 `provider` 中获取一个 `Signer`（签名者）。`Signer` 是一个有权发送交易（这会花费gas）的特殊对象。在本地测试环境中，它默认是Hardhat节点提供的第一个账户。

- **`const MyTokenFactory = new ethers.ContractFactory(MyToken.abi, MyToken.bytecode, signer);`**: 我们创建了一个 `ContractFactory`（合约工厂）。这是一个用于部署合约的辅助对象。我们把ABI、字节码和签名者传给它。

- **`const myToken = await MyTokenFactory.deploy(await signer.getAddress());`**: 我们调用工厂的 `deploy()` 方法来部署合约。
    - 我们传入了 `signer` 的地址作为参数，这个参数对应了我们合约 `constructor` 中的 `initialOwner`。这样，部署者就成为了合约的所有者。

- **`await myToken.waitForDeployment();`**: 这行代码会等待合约完全部署到区块链上并被确认。

- **`const address = await myToken.getAddress();`**: 我们获取了新部署合约的地址。

- **`main().then(...)`**: 这是一个标准的Node.js模式，用于执行异步的 `main` 函数并在完成后退出进程。

---

## 4. 前端页面: `my-app/app/page.tsx`

这是我们的Next.js前端页面，用户可以通过它与我们的智能合约进行交互。

```typescript
"use client";

import { useState } from "react";
import { ethers } from "ethers";
import MyToken from "./abi/MyToken.json";

// ... (部分JSX代码省略)

export default function Home() {
  const [status, setStatus] = useState("");

  const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";

  async function handleDeploy() {
    if (typeof window.ethereum === "undefined") {
      setStatus("Please install MetaMask!");
      return;
    }

    try {
      await window.ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, MyToken.abi, signer);

      setStatus("Minting 100 tokens...");
      const tx = await contract.mint(await signer.getAddress(), ethers.parseEther("100"));
      await tx.wait();
      setStatus("Tokens minted successfully!");
    } catch (error) {
      console.error(error);
      setStatus("An error occurred.");
    }
  }

  return (
    // ... JSX for the button
  );
}
```

### 代码逐行解释:

- **`"use client";`**: 这是Next.js的一个指令，表示这个组件是一个“客户端组件”。这意味着它的代码将在用户的浏览器中运行，而不是在服务器上。这对于需要与用户交互（如点击按钮）和访问浏览器API（如 `window.ethereum`）的组件是必需的。

- **`const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3";`**: 我们将之前部署的合约地址硬编码为一个常量。

- **`async function handleDeploy() { ... }`**: 这个函数会在用户点击“发布代币”按钮时被调用。

- **`if (typeof window.ethereum === "undefined") { ... }`**: 我们首先检查 `window.ethereum` 对象是否存在。这个对象是由MetaMask等钱包插件注入到浏览器中的。如果它不存在，就意味着用户没有安装MetaMask。

- **`await window.ethereum.request({ method: "eth_requestAccounts" });`**: 我们请求用户授权我们的应用访问他们的MetaMask账户。这会弹出一个MetaMask窗口让用户确认。

- **`const provider = new ethers.BrowserProvider(window.ethereum);`**: 在浏览器环境中，我们使用 `BrowserProvider` 并将 `window.ethereum` 传给它。这会创建一个 `provider`，它通过MetaMask与区块链进行通信。

- **`const signer = await provider.getSigner();`**: 我们从 `provider` 中获取一个 `signer`。在浏览器中，这个 `signer` 代表了用户在MetaMask中当前选中的账户。

- **`const contract = new ethers.Contract(contractAddress, MyToken.abi, signer);`**: 我们创建了一个 `Contract` 实例。这与部署脚本中的 `ContractFactory` 不同，`Contract` 实例是用来与一个**已经部署**的合约进行交互的。我们提供了合约的地址、ABI和签名者。

- **`const tx = await contract.mint(await signer.getAddress(), ethers.parseEther("100"));`**: 这是交互的核心！我们调用了 `contract` 实例的 `mint` 函数。
    - `ethers.js` 会自动将我们合约ABI中定义的 `mint` 函数映射到 `contract` 对象上。
    - 我们将用户的地址（`signer.getAddress()`）作为 `to` 参数，并将 `100` 个代币（`ethers.parseEther("100")` 将 "100" 转换为以太币的最小单位wei）作为 `amount` 参数。
    - 因为 `mint` 是一个需要合约所有者权限的函数，所以这个调用只有在用户（`signer`）是合约所有者时才会成功。

- **`await tx.wait();`**: 我们等待交易被矿工打包并确认。

- **`setStatus(...)`**: 我们使用React的 `useState` 来更新页面上的状态信息，向用户反馈操作的进展。

希望这份文档能帮助你更好地理解这个项目！