import type { Metadata } from 'next';
import './globals.css';
import WalletContextProvider from '@/components/WalletContextProvider';
import Header from '@/components/Header';
import ToastProvider from '@/components/Toaster';

export const metadata: Metadata = {
  title: 'DonorLens — Transparent NGO Donations on Solana',
  description:
    'Donate SOL to NGO projects with full on-chain transparency. Every donation is a verifiable Solana transaction.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <WalletContextProvider>
          <ToastProvider>
            <Header />
            <div className="border-b border-amber-500/20 bg-amber-500/10 py-1.5 text-center text-xs text-amber-400">
              You&apos;re on Solana Devnet — donations use test SOL. Need
              some?{' '}
              <a
                href="https://faucet.solana.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium underline hover:text-amber-300"
              >
                faucet.solana.com
              </a>
            </div>
            <main className="mx-auto max-w-6xl px-4 py-10">{children}</main>
          </ToastProvider>
        </WalletContextProvider>
      </body>
    </html>
  );
}
