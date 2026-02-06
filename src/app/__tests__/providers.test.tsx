import React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";
import { sepolia } from "wagmi/chains";
import { Providers } from "../providers";

const mockGetDefaultConfig = vi.fn(() => ({ mocked: true }));

vi.mock("@rainbow-me/rainbowkit", () => ({
  getDefaultConfig: (...args: unknown[]) => mockGetDefaultConfig(...args),
  RainbowKitProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock("wagmi", () => ({
  WagmiProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>
}));

vi.mock("viem", () => ({
  custom: vi.fn(() => ({ transport: true }))
}));

describe("Providers", () => {
  it("configures wagmi for Sepolia only", () => {
    render(
      <Providers>
        <div data-testid="child" />
      </Providers>
    );

    expect(screen.getByTestId("child")).toBeInTheDocument();
    expect(mockGetDefaultConfig).toHaveBeenCalledTimes(1);

    const configArg = mockGetDefaultConfig.mock.calls[0][0] as {
      chains: typeof sepolia[];
      transports: Record<number, unknown>;
      ssr: boolean;
    };

    expect(configArg.chains).toEqual([sepolia]);
    expect(configArg.transports[sepolia.id]).toBeDefined();
    expect(configArg.ssr).toBe(false);
  });
});
