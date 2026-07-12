'use client';

import dynamic from 'next/dynamic';
import { useWallet } from '@solana/wallet-adapter-react';
import { CLUSTER } from '@/lib/cluster';

const WalletMultiButton = dynamic(
  async () =>
    (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
);

export default function Header() {
  const { connected, disconnect } = useWallet();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold">
            Donor<span className="text-emerald-400">Lens</span>
          </span>
          <span className="rounded bg-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-400">
            {CLUSTER}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <WalletMultiButton />
          {connected && (
            <button
              onClick={() => disconnect().catch(() => {})}
              className="rounded-lg border border-slate-700 px-3 py-2 text-sm text-slate-400 transition hover:border-red-500/50 hover:text-red-400"
              title="Disconnect wallet"
            >
              Disconnect
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
