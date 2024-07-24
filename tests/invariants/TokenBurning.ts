import { Model } from "./types";
import { Simnet } from "@hirosystems/clarinet-sdk";
import { expect } from "vitest";

// checks that tokens are burned correctly when the STX target is reached
export const TokenBurning = (accounts: Map<string, string>) => ({
  run: (model: Model, real: Simnet) => {
    console.log("TokenBurning.run started");

    if (model.stxBalance >= model.stxTargetAmount) {
      const initialSupply = model.tokenBalance;
      const burnAmount = (initialSupply * model.burnPercent) / 100n;

      const result = real.callPublicFn(
        "bonding-curve-dex",
        "burn-tokens",
        [],
        accounts.values().next().value
      );

      expect(result.result).toBeOk();
      expect(model.tokenBalance).toBe(initialSupply - burnAmount);
    }

    console.log("TokenBurning.run completed");
  },
});