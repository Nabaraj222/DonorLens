'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useWallet } from '@solana/wallet-adapter-react';
import type { Project } from '@/lib/projects';
import type { Donation } from '@/lib/useDonations';
import { explorerTx } from '@/lib/cluster';
import DonateModal from '@/components/DonateModal';

function truncate(address: string) {
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

function timeAgo(ts: number | null) {
  if (!ts) return '';
  const s = Math.floor(Date.now() / 1000 - ts);
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

export default function ProjectCard({
  project,
  donations,
  onDonated,
}: {
  project: Project;
  donations: Donation[] | null;
  onDonated?: () => void;
}) {
  const { connected } = useWallet();
  const [open, setOpen] = useState(false);

  const raised = donations?.reduce((sum, d) => sum + d.sol, 0) ?? 0;

  return (
    <div className="flex flex-col overflow-hidden rounded-xl border border-slate-800 bg-slate-900 transition hover:border-slate-700">
      <div className="relative h-44 w-full">
        <Image
          src={project.imageUrl}
          alt={project.name}
          fill
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          className="object-cover"
        />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <h2 className="text-lg font-semibold">{project.name}</h2>
        <p className="flex-1 text-sm text-slate-400">{project.description}</p>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>
              Raised:{' '}
              <span className="font-medium text-emerald-400">
                {raised.toFixed(3)} SOL
              </span>
            </span>
            <span>
              Goal:{' '}
              <span className="font-medium text-slate-300">
                {project.goalSol} SOL
              </span>
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-emerald-500 transition-all"
              style={{
                width: `${Math.min(100, (raised / project.goalSol) * 100)}%`,
              }}
            />
          </div>
        </div>

        <button
          disabled={!connected}
          title={connected ? undefined : 'Connect wallet to donate'}
          onClick={() => setOpen(true)}
          className="mt-1 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
        >
          {connected ? 'Donate' : 'Connect wallet to donate'}
        </button>

        <div className="border-t border-slate-800 pt-3">
          <p className="mb-2 text-xs font-medium uppercase tracking-wide text-slate-500">
            Recent donations
          </p>
          {!donations && (
            <p className="text-xs text-slate-600">Loading from chain…</p>
          )}
          {donations && donations.length === 0 && (
            <p className="text-xs text-slate-600">
              No donations yet — be the first.
            </p>
          )}
          {donations && donations.length > 0 && (
            <ul className="flex flex-col gap-1.5">
              {donations.slice(0, 5).map((d) => (
                <li
                  key={d.signature}
                  className="flex items-center justify-between text-xs"
                >
                  <a
                    href={explorerTx(d.signature)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-slate-400 hover:text-emerald-400"
                    title="View on Explorer"
                  >
                    {truncate(d.sender)}
                  </a>
                  <span className="text-emerald-400">{d.sol} SOL</span>
                  <span className="text-slate-600">{timeAgo(d.time)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {open && (
        <DonateModal
          project={project}
          onClose={() => setOpen(false)}
          onDonated={onDonated}
        />
      )}
    </div>
  );
}
