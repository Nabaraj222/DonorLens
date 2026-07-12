# DonorLens

Transparent NGO donations on Solana **Devnet**. Donors connect a wallet, pick a project, and donate SOL. Every donation is a real on-chain transaction with a memo identifying the project — verifiable by anyone on the Solana Explorer.

## How it works

```
Browser (Next.js 14 + Tailwind)
  ├─ Wallet connect: @solana/wallet-adapter (Wallet Standard — Phantom
  │  self-registers; no legacy adapter instances)
  ├─ Projects: hardcoded in lib/projects.ts, served by GET /api/projects
  │  (mock backend — swap for a DB later without touching the UI)
  └─ Donate: SystemProgram.transfer → single treasury wallet
             + SPL memo "donation:<projectId>"
                      │
                      ▼
               Solana Devnet (Helius RPC)
                      │
                      ▼
  Donation history: read back on-chain per project by matching
  transfers into the treasury with their memo
```

Key design decision: **one treasury wallet for all projects**. The project a donation belongs to is tracked by the transaction memo (`donation:clean-water-nepal` etc.), not by separate wallets. The chain itself is the donation database — there is no server-side storage at all.

## Project structure

| File | Purpose |
|------|---------|
| `lib/cluster.ts` | Single source of truth for the cluster (`devnet`) + explorer link helper. Change one line to switch networks. |
| `lib/projects.ts` | `DONATION_WALLET` (treasury address) + 6 hardcoded NGO projects |
| `lib/useDonations.ts` | Reads recent donations from chain (signatures → parsed txs → transfers + memos) |
| `app/api/projects/route.ts` | Mock backend serving project metadata |
| `app/page.tsx` | Project grid, skeletons, chain-error banner |
| `components/WalletContextProvider.tsx` | Connection (env-overridable RPC) + wallet + modal providers |
| `components/Header.tsx` | Brand, cluster badge, wallet button, explicit Disconnect |
| `components/ProjectCard.tsx` | Card: image, goal/raised progress bar, wallet-gated Donate, recent donations list |
| `components/DonateModal.tsx` | Amount input → transfer+memo tx → wallet approval → confirm → txId + explorer link |
| `components/Toaster.tsx` | Toast system (success toast links to the explorer) |
| `.env.local` | `NEXT_PUBLIC_RPC_URL` — dedicated Helius devnet endpoint (gitignored) |

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Setup checklist:

1. **Phantom** extension with Testnet Mode ON and **Solana Devnet** selected (Settings → Developer Settings). The network MUST match the app's cluster — a mismatch shows a balance but disables/fails transactions.
2. **Devnet SOL** in the donor wallet: https://faucet.solana.com (select Devnet).
3. Optional but recommended — dedicated RPC in `.env.local`:
   `NEXT_PUBLIC_RPC_URL=https://devnet.helius-rpc.com/?api-key=<key>`
   Must be a **devnet** endpoint, matching `lib/cluster.ts`.

## Donation flow

1. Connect wallet (Donate buttons stay disabled until connected).
2. Pick a project → enter amount (min 0.001 SOL) → Confirm in Phantom.
3. App confirms the tx at `confirmed` commitment and shows the txId + explorer link (`?cluster=devnet`).
4. Card history and Raised totals refresh automatically from the chain.

## Implementation notes & gotchas (learned the hard way)

- **No legacy wallet adapters.** Phantom registers via the Wallet Standard; instantiating `PhantomWalletAdapter` is redundant and its popup triggering misbehaved in Edge. `wallets={[]}` is correct.
- **Helius free tier forbids batch RPC.** `getParsedTransactions` (plural) 403s; the app fetches transactions individually, 5 in parallel per chunk.
- **Commitment levels must match.** History reads at `confirmed` — the default `finalized` lags ~30s and made fresh donations invisible.
- **Avoid `clusterApiUrl('testnet')`.** Solana testnet's public RPC is unreliable (multi-minute hangs); devnet + a dedicated RPC is the right dev setup.
- **Test-SOL never crosses networks.** Devnet, testnet, and mainnet balances are separate ledgers for the same address.
- The treasury needs no funding — it only receives.
- Disconnect from the app doesn't revoke the site in Phantom (Settings → Trusted apps does).

## Going to mainnet (later)

1. `lib/cluster.ts` → `CLUSTER = 'mainnet-beta'`
2. `.env.local` → mainnet RPC endpoint
3. `lib/projects.ts` → treasury wallet the NGO actually controls (hardware wallet / multisig recommended)
4. Restrict the RPC api-key to your domain; consider rotating it
5. Real project metadata + a real backend if projects become dynamic

## Status

**Completed** — all five milestones (scaffold + wallet connect, project listings, donation transactions, on-chain donation history, polish) are done and verified end-to-end on devnet.
