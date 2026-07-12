'use client';

import { useMemo } from 'react';
import { clusterApiUrl } from '@solana/web3.js';
import {
  ConnectionProvider,
  WalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { CLUSTER } from '@/lib/cluster';

import '@solana/wallet-adapter-react-ui/styles.css';

export default function WalletContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // Cluster is set in lib/cluster.ts. Override the RPC endpoint via
  // NEXT_PUBLIC_RPC_URL when using a dedicated provider (Helius, QuickNode).
  const endpoint = useMemo(
    () => process.env.NEXT_PUBLIC_RPC_URL ?? clusterApiUrl(CLUSTER),
    []
  );

  // No legacy adapters: Phantom (and other modern wallets) self-register
  // via the Wallet Standard, which the adapter picks up automatically.
  const wallets = useMemo(() => [], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>{children}</WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
