import Link from 'next/link';

export default function Page() {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Wagmi Demo Home</h1>
      <Link href="/wagmi/dashboard">进入Dashboard </Link>
    </div>
  );
}
