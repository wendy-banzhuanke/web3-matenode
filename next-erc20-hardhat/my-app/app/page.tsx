'use client';

import Link from 'next/link'

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4 p-8">
      <Link href="/erc20"><div className="px-4 py-2 border rounded hover:bg-gray-100">ERC20(ethers V6)</div></Link>
      <Link href="/wagmi"><div className="px-4 py-2 border rounded hover:bg-gray-100">Wagmi</div></Link>
    </main>
  );
}
