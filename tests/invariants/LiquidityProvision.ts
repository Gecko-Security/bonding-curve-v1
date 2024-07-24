import { Model } from "./types";
import { Simnet } from "@hirosystems/clarinet-sdk";
import { expect } from "vitest";

// checks that liquidity is provided to the DEX when the STX target amount is reached

export const LiquidityProvision = (accounts: Map<string, string>) => ({
  run: (model: Model, real: Simnet) => {
    console.log("LiquidityProvision.run started");

    if (model.stxBalance >= model.stxTargetAmount) {
      const result = real.callPublicFn(
        "bonding-curve-dex",
        "provide-liquidity",
        [],
        accounts.values().next().value
      );

      expect(result.result).toBeOk();
      expect(model.tradable).toBe(false);
      expect(model.stxBalance).toBe(0n);
      expect(model.tokenBalance).toBe(0n);
    }

    console.log("LiquidityProvision.run completed");
  },
});