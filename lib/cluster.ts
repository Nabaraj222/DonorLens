// Single source of truth for which Solana cluster the app uses.
// Change this one line to switch networks ('devnet' | 'testnet' | 'mainnet-beta').
export const CLUSTER = 'devnet' as const;

export const explorerTx = (signature: string) =>
  `https://explorer.solana.com/tx/${signature}?cluster=${CLUSTER}`;
