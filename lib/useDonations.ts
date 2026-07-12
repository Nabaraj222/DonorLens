'use client';

import { useCallback, useEffect, useState } from 'react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { useConnection } from '@solana/wallet-adapter-react';
import { DONATION_WALLET } from '@/lib/projects';

export type Donation = {
  signature: string;
  sender: string;
  sol: number;
  time: number | null;
  projectId: string | null;
};

// Reads recent donations straight from the chain: every transfer INTO the
// treasury wallet, matched with its "donation:<projectId>" memo.
export function useDonations() {
  const { connection } = useConnection();
  const [donations, setDonations] = useState<Donation[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const treasury = new PublicKey(DONATION_WALLET);
      const sigs = await connection.getSignaturesForAddress(
        treasury,
        { limit: 25 },
        'confirmed'
      );
      if (sigs.length === 0) {
        setDonations([]);
        return;
      }
      // Helius free tier forbids batch RPC calls, so fetch transactions
      // one by one, 5 in parallel at a time.
      const txs: Awaited<
        ReturnType<typeof connection.getParsedTransaction>
      >[] = [];
      const CHUNK = 5;
      for (let i = 0; i < sigs.length; i += CHUNK) {
        const part = await Promise.all(
          sigs.slice(i, i + CHUNK).map((s) =>
            connection.getParsedTransaction(s.signature, {
              maxSupportedTransactionVersion: 0,
              commitment: 'confirmed',
            })
          )
        );
        txs.push(...part);
      }

      const result: Donation[] = [];
      txs.forEach((tx, i) => {
        if (!tx || tx.meta?.err) return;
        const info = sigs[i];
        for (const ix of tx.transaction.message.instructions) {
          if (
            'parsed' in ix &&
            ix.program === 'system' &&
            ix.parsed?.type === 'transfer' &&
            ix.parsed.info.destination === DONATION_WALLET
          ) {
            const memoMatch = info.memo?.match(/donation:([\w-]+)/);
            result.push({
              signature: info.signature,
              sender: ix.parsed.info.source,
              sol: ix.parsed.info.lamports / LAMPORTS_PER_SOL,
              time: info.blockTime ?? null,
              projectId: memoMatch ? memoMatch[1] : null,
            });
            break;
          }
        }
      });
      setDonations(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }, [connection]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  return { donations, error, loading, refresh };
}
