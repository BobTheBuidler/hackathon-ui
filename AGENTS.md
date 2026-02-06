# AGENTS.md

## Intent
Build a minimal, polished UI that lets a user connect their wallet and deposit YFI into stYFI. The current implementation already reads YFI allowance and can send an ERC20 approve; the deposit action is still a stub.

## Current Stage (as of 2026-02-06)
- Next.js App Router skeleton exists with global styling and a single page.
- Wallet connect UI works via RainbowKit + wagmi.
- Reads YFI allowance for the stYFI spender and can send `approve`.
- Deposit button exists but does nothing (no contract write).
- CSS for a right-side panel exists but the panel isn't rendered.
- No README or tests.

## Architecture / Stack
- Next.js 15 (App Router), React 18, TypeScript
- RainbowKit + wagmi + viem for wallet/contract interactions
- TanStack Query for wagmi caching
- CSS in `src/app/globals.css` with Space Grotesk / DM Mono

## Key Files
- `src/app/page.tsx`: main UI, allowance read, approve action, deposit button stub
- `src/app/providers.tsx`: wagmi/RainbowKit config, WalletConnect project id, injected provider transport
- `src/app/layout.tsx`: app shell + Providers
- `src/app/globals.css`: styles and component classes
- `.env.local`: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`

## Contracts (hardcoded today)
- YFI: `0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e`
- stYFI (spender): `0x42b25284E8ae427D79da78b65DFFC232aAECc016`

## Runtime Flow
- `Providers` builds wagmi config using the injected EIP-1193 provider as the transport for all chains.
- `page.tsx`:
  - `useAccount`, `useChainId`
  - `useReadContract(allowance)` for YFI -> stYFI
  - `useWriteContract(approve)` for YFI approval
  - `parseUnits` for user input
  - UI shows connect/chain/account buttons, allowance, and a mainnet-only warning
  - Approve button appears when allowance < amount
  - Deposit button appears when allowance >= amount (no handler)

## Known Gaps / TODO
- Implement deposit transaction for stYFI (ABI + method + args).
- Verify the correct stYFI deposit contract and function signature.
- Add `useWaitForTransactionReceipt` and success/error handling for approve + deposit.
- Gate reads/writes by chain (mainnet only) and provide an explicit "Switch network" flow.
- Use `formatUnits` instead of `Number()` for allowance display to avoid overflow.
- Render the missing right-side panel or remove unused CSS/classes.
- Add loading/error states for allowance reads.
- Decide whether to use public RPC transports (instead of injected provider) for reads.
- Add README and minimal tests (optional).

## Commands
- `npm install`
- `npm run dev`
- `npm run lint`
- `npm run build`
- `npm run start`

## Assumptions
- WalletConnect project id is required for non-injected wallets.
- ERC20 `approve` returns `bool` (YFI does).
- UI targets Ethereum mainnet.

## Open Questions
- What is the exact stYFI deposit contract + ABI (function name, args, decimals)?
- Should we support testnets or only mainnet?
- Desired UX after approve/deposit (toasts, confirmations, tx history)?
- Should allowance be set to exact amount or "max"?
