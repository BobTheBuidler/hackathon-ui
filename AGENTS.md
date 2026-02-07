# AGENTS.md

## Intent
Build a minimal, polished UI that lets a user connect their wallet and deposit YFI into stYFI. The UI reads allowance, can send ERC20 `approve`, and calls ERC4626 `deposit(assets, receiver)`.

## Current Stage (as of 2026-02-06)
- Next.js App Router skeleton exists with global styling and a single page.
- Wallet connect UI works via RainbowKit + wagmi.
- Reads YFI allowance for the stYFI spender and can send `approve`.
- Deposit button calls ERC4626 `deposit(assets, receiver)` on stYFI.
- When used with the companion `~/projects/hackathon` extension, approvals can be captured and allowance reads can be spoofed so the UI proceeds to deposit.
- Tests cover Sepolia config and approval flow (Vitest + React Testing Library).
- CSS for a right-side panel exists but the panel isn't rendered.
- No README yet.

## Architecture / Stack
- Next.js 15 (App Router), React 18, TypeScript
- RainbowKit + wagmi + viem for wallet/contract interactions
- TanStack Query for wagmi caching
- CSS in `src/app/globals.css` with Space Grotesk / DM Mono
 - Uses `window.ethereum` via wagmi `custom(...)` transport, so any injected provider (MetaMask or the passthrough extension) is in the call path.

## Key Files
- `src/app/page.tsx`: main UI, allowance read, approve action, deposit button stub
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
 - With the `hackathon` extension enabled:
   - `approve` (`eth_sendTransaction` with `0x095ea7b3`) is blocked and stored by the extension.
   - `allowance` (`eth_call` with `0xdd62ed3e`) can be spoofed to match the stored approval, so the UI enables Deposit.
   - `deposit` still passes through to MetaMask as a normal transaction.

## Companion Repo: `~/projects/hackathon` (Chrome extension)
- Injects `inpage.js` at `document_start`, exposes `window.passthroughEthereum`, and can override `window.ethereum`.
- Intercepts ERC20 approvals, stores them in `chrome.storage.local`, and blocks the tx from reaching MetaMask.
- Spoofs `allowance` reads when a matching approval is stored.
- Does **not** create an on-chain bundle; it only changes UI behavior by blocking approvals and faking allowance.

## Known Gaps / TODO
- Confirm stYFI deposit ABI/decimals on chain if the interface changes.
- Add `useWaitForTransactionReceipt` and success/error handling for approve + deposit.
- Gate reads/writes by chain (Sepolia only) and provide an explicit "Switch network" flow.
- Use `formatUnits` instead of `Number()` for allowance display to avoid overflow.
- Render the missing right-side panel or remove unused CSS/classes.
- Add loading/error states for allowance reads.
- Decide whether to use public RPC transports (instead of injected provider) for reads.
- Add README and expand test coverage.
 - If true "single-signature" bundling is required, implement a permit/Permit2 path or an on-chain bundle; the current extension only blocks approvals and spoofs allowance.

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
 - The `hackathon` extension is optional; without it, approvals and deposits go directly to MetaMask.

## Open Questions
- What is the exact stYFI deposit contract + ABI (function name, args, decimals)?
- Should we support other testnets or only Sepolia?
- Desired UX after approve/deposit (toasts, confirmations, tx history)?
- Should allowance be set to exact amount or "max"?
 - Do we actually want true bundled/single-signature flows (permit-based), or is the extension’s approval-capture + allowance-spoofing sufficient?
