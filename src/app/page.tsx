"use client";

import { ConnectButton } from "@rainbow-me/rainbowkit";
import { useMemo, useState } from "react";
import { useAccount, useChainId, useReadContract, useWriteContract } from "wagmi";
import { parseUnits } from "viem";

const YFI_ADDRESS = "0xD4c188F035793EEcaa53808Cc067099100b653Ba";
const STYFI_ADDRESS = "0x4FeC571e38EB31ae8c8C51B8b6Bcb404514dC822";

const erc20Abi = [
  {
    type: "function",
    name: "allowance",
    stateMutability: "view",
    inputs: [
      { name: "owner", type: "address" },
      { name: "spender", type: "address" }
    ],
    outputs: [{ name: "amount", type: "uint256" }]
  },
  {
    type: "function",
    name: "approve",
    stateMutability: "nonpayable",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" }
    ],
    outputs: [{ name: "success", type: "bool" }]
  }
] as const;

export default function Home() {
  const [amount, setAmount] = useState("");
  const { address, isConnected } = useAccount();
  const chainId = useChainId();
  const { writeContract, isPending } = useWriteContract();
  const isSepolia = chainId === 11155111;

  const { data: allowance } = useReadContract({
    address: YFI_ADDRESS,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, STYFI_ADDRESS] : undefined,
    query: {
      enabled: Boolean(address),
      refetchInterval: 5_000
    }
  });

  const parsedAmount = useMemo(() => {
    if (!amount) return undefined;
    try {
      return parseUnits(amount, 18);
    } catch {
      return undefined;
    }
  }, [amount]);

  const needsAllowance =
    isConnected &&
    parsedAmount !== undefined &&
    allowance !== undefined &&
    allowance < parsedAmount;
  const canDeposit =
    isConnected &&
    parsedAmount !== undefined &&
    allowance !== undefined &&
    allowance >= parsedAmount;

  const handleApprove = () => {
    if (!parsedAmount) return;
    writeContract({
      address: YFI_ADDRESS,
      abi: erc20Abi,
      functionName: "approve",
      args: [STYFI_ADDRESS, parsedAmount]
    });
  };

  return (
    <main className="main">
      <section className="shell">
        <div className="topbar">
          <div className="top-actions">
            <ConnectButton.Custom>
              {({
                account,
                chain,
                openAccountModal,
                openChainModal,
                openConnectModal,
                mounted
              }) => {
                const ready = mounted;
                const connected = ready && account && chain;

                if (!connected) {
                  return (
                    <button className="rk-button" onClick={openConnectModal} type="button">
                      Connect Wallet
                    </button>
                  );
                }

                return (
                  <>
                    <button className="rk-button" onClick={openChainModal} type="button">
                      {chain?.name}
                    </button>
                    <button className="rk-button" onClick={openAccountModal} type="button">
                      {account?.displayName}
                    </button>
                  </>
                );
              }}
            </ConnectButton.Custom>
          </div>
        </div>
        <div className="hero">
          <div className="badge">YFI Deposit</div>
          <h1>Enter your deposit amount</h1>
          <p>Provide the amount of YFI you want to deposit into stYFI.</p>
          <label className="input-label" htmlFor="yfi-amount">
            Amount
          </label>
          <input
            id="yfi-amount"
            className="input"
            type="number"
            min="0"
            step="0.0001"
            placeholder="0.00"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
          />
          <p className="allowance">
            Current allowance:{" "}
            {allowance === undefined ? "—" : (Number(allowance) / 1e18).toFixed(4)}{" "}
            YFI
          </p>
          {!isSepolia && (
            <p className="warning">Switch to Sepolia to use YFI.</p>
          )}
          {needsAllowance && (
            <button
              className="rk-button"
              type="button"
              onClick={handleApprove}
              disabled={isPending || !parsedAmount}
            >
              {isPending ? "Setting allowance..." : "Approve YFI"}
            </button>
          )}
          {canDeposit && (
            <button className="rk-button" type="button">
              Deposit YFI
            </button>
          )}
        </div>
      </section>
    </main>
  );
}
