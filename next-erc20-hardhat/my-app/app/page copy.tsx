'use client';

import { useState } from 'react';
import { ethers } from 'ethers';
import MyToken from './abi/MyToken.json';

declare global {
  interface Window {
    ethereum?: any;
  }
}

export default function Home() {
  const [status, setStatus] = useState('');
  const [searchBalanceStatus, setSearchBalanceStatus] = useState('');

  // const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';
  const contractAddress = '0x3Da8b4e3D12A1861930d9d691Bacbe24B2c093Fa';

  async function handleDeploy() {
    if (typeof window.ethereum === 'undefined') {
      setStatus('Please install MetaMask!');
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(contractAddress, MyToken.abi, signer);

      setStatus('Minting 100 tokens...');
      const tx = await contract.mint(await signer.getAddress(), ethers.parseEther('100'));
      await tx.wait();
      setStatus('Tokens minted successfully!');
    } catch (error) {
      console.error(error);
      setStatus('An error occurred.');
    }
  }

  async function handleSearchBalanceOf() {
    if (typeof window.ethereum === 'undefined') {
      setSearchBalanceStatus('Please install MetaMask!');
      return;
    }

    try {
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      const provider = new ethers.BrowserProvider(window.ethereum);
      const signer = await provider.getSigner();
      console.log("signer====", signer)
      const contract = new ethers.Contract(contractAddress, MyToken.abi, signer);

      const _addr = await signer.getAddress()
      setSearchBalanceStatus('Querying balance...' + _addr);
      const balance = await contract.balanceOf(_addr);
      console.log('Raw balance:', balance);
      // setSearchBalanceStatus(`Your current balance is: ${ethers.formatEther(balance)} DUOLIAAA`);
    } catch (error) {
      console.error(error);
      setSearchBalanceStatus('An error occurred while querying the balance.');
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24 gap-8">
      <div className="flex flex-col items-center">
        <button
          onClick={handleDeploy}
          className="group rounded-lg border px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={'mb-3 text-2xl font-semibold'}>
            发布代币{" "}
          </h2>
          <p className={'m-0 max-w-[30ch] text-sm opacity-50'}>
            向您的账户增发100个代币。
          </p>
        </button>
        {status && <p className="mt-4">{status}</p>}
      </div>

      <div className="h-px bg-gray-300 w-full max-w-md"></div>

      <div className="flex flex-col items-center">
        <button
          onClick={handleSearchBalanceOf}
          className="group rounded-lg border px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
        >
          <h2 className={'mb-3 text-2xl font-semibold'}>
            查询您账户的余额
          </h2>
        </button>
        {searchBalanceStatus && <p className="mt-4">{searchBalanceStatus}</p>}
      </div>
    </main>
  );
}