# AGENTS.md

## Intent
Build a minimal, polished UI that lets a user connect their wallet and deposit YFI into stYFI.

## Current Stage (as of 2026-02-07)
- Next.js App Router app with a single page and global styling.
- Wallet connect UI works via RainbowKit (custom connect/chain/account buttons).
- Reads YFI allowance for the stYFI spender and can send ERC20 `approve`.
- Deposit action calls ERC4626 `deposit(assets, receiver)` on stYFI.
- Requires the hackathon extension to capture approvals and spoof allowance reads before deposit.
- UI gates approve/deposit actions to Sepolia and shows a warning on other chains.
- Tests exist for Sepolia config and approve/deposit flow (Vitest + React Testing Library).
- CSS includes a right-side panel design, but the panel is not rendered.
- No README yet.

## Context
- This spec is for `0xkorin/hackathon-ui`.

## Architecture / Stack
- Next.js 15 (App Router), React 18, TypeScript
- RainbowKit + wagmi + viem for wallet/contract interactions
- TanStack Query for wagmi caching
- Vitest + React Testing Library for tests
- CSS in `src/app/globals.css` with Space Grotesk / DM Mono

## Key Files
- `src/app/page.tsx`: main UI, allowance read, approve + deposit actions
- `src/app/providers.tsx`: wagmi/RainbowKit config, WalletConnect project id, injected provider transport
- `src/app/layout.tsx`: app shell + Providers
- `src/app/globals.css`: styles and component classes
- `src/app/__tests__/page.test.tsx`: approve/deposit flow tests
- `src/app/__tests__/providers.test.tsx`: wagmi config test
- `.env.local`: `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`
- `vitest.config.ts`, `vitest.setup.ts`: test config

## Contracts (hardcoded today)
- YFI: `0xD4c188F035793EEcaa53808Cc067099100b653Ba`
- stYFI (spender + deposit): `0x4FeC571e38EB31ae8c8C51B8b6Bcb404514dC822`
- Decimals assumed 18 (`parseUnits(amount, 18)`)

## Runtime Flow
- `Providers`:
  - `getDefaultConfig` with `chains: [sepolia]`
  - transport uses injected `window.ethereum` via `viem.custom`; throws if no wallet provider
  - multicall disabled (`batch: { multicall: false }`), `ssr: false`
- `page.tsx`:
  - `useAccount`, `useChainId`
  - `useReadContract(allowance)` for YFI -> stYFI, enabled when address exists, refetch every 5s
  - `parseUnits` for input; invalid input results in `undefined`
  - Approve button shown when allowance < amount; Deposit when allowance >= amount
  - Allowance displayed with `Number(allowance) / 1e18`
- With the hackathon extension enabled (required):
  - ERC20 `approve` (`eth_sendTransaction` with `0x095ea7b3`) is blocked and stored by the extension.
  - `allowance` (`eth_call` with `0xdd62ed3e`) can be spoofed to match stored approvals, enabling Deposit in the UI.
  - `deposit` still goes to MetaMask as a normal transaction (no on-chain bundle).

## Companion Repo: `https://github.com/0xkorin/hackathon` (Chrome extension)
- Injects `inpage.js` at `document_start`, exposes `window.passthroughEthereum`, and can override `window.ethereum`.
- Intercepts ERC20 approvals, stores them in `chrome.storage.local`, and blocks the tx from reaching MetaMask.
- Spoofs `allowance` reads when a matching approval is stored.
- Does **not** create an on-chain bundle; it only changes UI behavior by blocking approvals and faking allowance.

## Reference Transaction
- Sepolia test tx (success): `https://sepolia.etherscan.io/tx/0x43f9d50160e98104eade0a47da8166630a6198954651426c581e5de4e7c89a8e#eventlog`

## Tests
- `page.test.tsx`: warns off-Sepolia; approves via YFI `approve`; deposits via ERC4626 `deposit`
- `providers.test.tsx`: configures wagmi for Sepolia and creates a transport

## Commands
- `npm install`
- `npm run dev`
- `npm run lint`
- `npm test`
- `npm run build`
- `npm run start`

## Known Gaps / TODO
- Add `useWaitForTransactionReceipt` + success/error handling for approve and deposit.
- Gate allowance reads by chain (or handle read errors on wrong chain).
- Replace `Number(allowance)` with `formatUnits` to avoid overflow.
- Add loading/error states for allowance reads and invalid input handling.
- Provide an explicit “Switch network” flow (not just warning).
- Decide whether to use public RPC transports for reads when no wallet is connected.
- Render the right-side panel or remove unused CSS/classes.
- Add README; expand test coverage (pending/error states, invalid input).

## Assumptions
- WalletConnect project id required for non-injected wallets.
- ERC20 `approve` returns `bool`.
- UI targets Sepolia (chain id 11155111).
- The hackathon extension is required; approvals are captured and allowance reads spoofed before deposit.

## Open Questions
- Should approvals be exact-amount or max-allowance?
- Should we support other networks besides Sepolia?
- Desired UX after approve/deposit (toasts, confirmations, tx history)?
- What should the right-side panel content be?
