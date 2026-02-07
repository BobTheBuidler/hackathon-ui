# AGENTS.md

## Intent
Build a minimal, polished UI that lets a user connect their wallet and deposit YFI into stYFI. The current implementation already reads YFI allowance and can send an ERC20 approve; the deposit action calls ERC4626 `deposit(assets, receiver)`.

## Current Stage (as of 2026-02-06)
- Next.js App Router skeleton exists with global styling and a single page.
- Wallet connect UI works via RainbowKit + wagmi.
- Reads YFI allowance for the stYFI spender and can send `approve`.
- Deposit button calls ERC4626 `deposit(assets, receiver)` on stYFI.
- Requires the hackathon extension to capture approvals and spoof allowance reads before deposit.
- Tests cover Sepolia config and approval flow (Vitest + React Testing Library).
- CSS for a right-side panel exists but the panel isn't rendered.
- No README yet.

## Architecture / Stack
- Next.js 15 (App Router), React 18, TypeScript
- RainbowKit + wagmi + viem for wallet/contract interactions
- TanStack Query for wagmi caching
- CSS in `src/app/globals.css` with Space Grotesk / DM Mono

## Key Files
- `src/app/page.tsx`: main UI, allowance read, approve action, deposit action
- `src/app/providers.tsx`: wagmi/RainbowKit config, WalletConnect project id, injected provider transport
- `src/app/layout.tsx`: app shell + Providers
- `src/app/globals.css`: styles and component classes
- `.env.local`: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

## Contracts (hardcoded today)
- YFI: `0xD4c188F035793EEcaa53808Cc067099100b653Ba`
- stYFI (spender): `0x4FeC571e38EB31ae8c8C51B8b6Bcb404514dC822`

## Runtime Flow
- `Providers` builds wagmi config using the injected EIP-1193 provider as the transport for all chains.
- `page.tsx`:
  - `useAccount`, `useChainId`
  - `useReadContract(allowance)` for YFI -> stYFI
  - `useWriteContract(approve)` for YFI approval
  - `parseUnits` for user input
  - UI shows connect/chain/account buttons, allowance, and a Sepolia-only warning
  - Approve button appears when allowance < amount
  - Deposit button appears when allowance >= amount and triggers `deposit`
- With the hackathon extension enabled (required, https://github.com/0xkorin/hackathon):
  - ERC20 `approve` (`eth_sendTransaction` with `0x095ea7b3`) is blocked and stored by the extension.
  - `allowance` (`eth_call` with `0xdd62ed3e`) can be spoofed to match stored approvals, enabling Deposit in the UI.
  - `deposit` still goes to MetaMask as a normal transaction (no on-chain bundle).

## Known Gaps / TODO
- Add `useWaitForTransactionReceipt` and success/error handling for approve + deposit.
- Gate reads/writes by chain (Sepolia only) and provide an explicit "Switch network" flow.
- Use `formatUnits` instead of `Number()` for allowance display to avoid overflow.
- Render the missing right-side panel or remove unused CSS/classes.
- Add loading/error states for allowance reads.
- Decide whether to use public RPC transports (instead of injected provider) for reads.
- Add README and expand test coverage.

## Commands
- `npm install`
- `npm run dev`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run start`

## Assumptions
- WalletConnect project id is required for non-injected wallets.
- ERC20 `approve` returns `bool` (YFI does).
- UI targets Sepolia.
- The hackathon extension is required; approvals are captured and allowance reads spoofed before deposit.

## Open Questions
- Should we support other testnets or only Sepolia?
- Desired UX after approve/deposit (toasts, confirmations, tx history)?
- Should allowance be set to exact amount or "max"?
