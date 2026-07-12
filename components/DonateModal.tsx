'use client';

import { useState } from 'react';
import {
  LAMPORTS_PER_SOL,
  PublicKey,
  SystemProgram,
  Transaction,
} from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { createMemoInstruction } from '@solana/spl-memo';
import { DONATION_WALLET, type Project } from '@/lib/projects';
import { CLUSTER, explorerTx } from '@/lib/cluster';
import { useToast } from '@/components/Toaster';

type Status =
  | { kind: 'idle' }
  | { kind: 'sending'; step: string }
  | { kind: 'success'; signature: string }
  | { kind: 'error'; message: string };

export default function DonateModal({
  project,
  onClose,
  onDonated,
}: {
  project: Project;
  onClose: () => void;
  onDonated?: (signature: string) => void;
}) {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { push } = useToast();
  const [amount, setAmount] = useState('0.1');
  const [status, setStatus] = useState<Status>({ kind: 'idle' });

  const parsed = parseFloat(amount);
  const validAmount = !isNaN(parsed) && parsed >= 0.001;

  async function donate() {
    if (!publicKey || !validAmount) return;

    if (DONATION_WALLET.includes('PASTE')) {
      setStatus({
        kind: 'error',
        message:
          'Donation wallet is not configured yet (lib/projects.ts → DONATION_WALLET).',
      });
      return;
    }

    let recipient: PublicKey;
    try {
      recipient = new PublicKey(DONATION_WALLET);
    } catch {
      setStatus({
        kind: 'error',
        message: 'Invalid donation wallet address in lib/projects.ts.',
      });
      return;
    }

    try {
      setStatus({ kind: 'sending', step: 'Waiting for wallet approval…' });
      console.log('[donate] start', new Date().toISOString());

      const tx = new Transaction()
        .add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipient,
            lamports: Math.round(parsed * LAMPORTS_PER_SOL),
          })
        )
        .add(createMemoInstruction(`donation:${project.id}`));

      console.log('[donate] tx built, requesting wallet signature', new Date().toISOString());
      const signature = await sendTransaction(tx, connection);
      console.log('[donate] wallet approved, signature received', new Date().toISOString());

      setStatus({ kind: 'sending', step: `Confirming on ${CLUSTER}…` });
      const latest = await connection.getLatestBlockhash();
      console.log('[donate] blockhash fetched, confirming', new Date().toISOString());
      await connection.confirmTransaction(
        { signature, ...latest },
        'confirmed'
      );

      setStatus({ kind: 'success', signature });
      push({
        kind: 'success',
        text: `Donated ${parsed} SOL to ${project.name}`,
        link: {
          href: explorerTx(signature),
          label: 'View on Explorer',
        },
      });
      onDonated?.(signature);
    } catch (e: unknown) {
      const raw = e instanceof Error ? e.message : String(e);
      let message = raw;
      if (/user rejected/i.test(raw)) message = 'You rejected the transaction in your wallet.';
      else if (/insufficient|debit an account/i.test(raw))
        message = `Insufficient ${CLUSTER} SOL. Get more at faucet.solana.com.`;
      setStatus({ kind: 'error', message });
    }
  }

  const explorerUrl =
    status.kind === 'success'
      ? explorerTx(status.signature)
      : '';

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-xl border border-slate-700 bg-slate-900 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h3 className="text-lg font-semibold">Donate to {project.name}</h3>
            <p className="text-xs text-slate-500">
              Tagged on-chain as{' '}
              <span className="font-mono text-slate-400">
                donation:{project.id}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {status.kind === 'success' ? (
          <div className="flex flex-col gap-3">
            <p className="text-emerald-400">Donation confirmed 🎉</p>
            <div className="rounded-lg bg-slate-800 p-3">
              <p className="mb-1 text-xs text-slate-500">Transaction ID</p>
              <p className="break-all font-mono text-xs text-slate-300">
                {status.signature}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => navigator.clipboard.writeText(status.signature)}
                className="flex-1 rounded-lg border border-slate-700 px-4 py-2 text-sm hover:bg-slate-800"
              >
                Copy txId
              </button>
              <a
                href={explorerUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 rounded-lg bg-emerald-600 px-4 py-2 text-center text-sm font-semibold hover:bg-emerald-500"
              >
                View on Explorer
              </a>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="text-slate-400">Amount (SOL)</span>
              <input
                type="number"
                min="0.001"
                step="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={status.kind === 'sending'}
                className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 outline-none focus:border-emerald-500"
              />
              {!validAmount && (
                <span className="text-xs text-red-400">
                  Enter at least 0.001 SOL
                </span>
              )}
            </label>

            {status.kind === 'error' && (
              <p className="rounded-lg bg-red-500/10 p-3 text-sm text-red-400">
                {status.message}
              </p>
            )}

            <button
              onClick={donate}
              disabled={!validAmount || status.kind === 'sending'}
              className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold hover:bg-emerald-500 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {status.kind === 'sending' ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                  {status.step}
                </span>
              ) : (
                `Donate ${validAmount ? parsed : ''} SOL`
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
