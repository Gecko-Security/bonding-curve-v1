import { Model } from "./types";
import { Simnet } from "@hirosystems/clarinet-sdk";
import { expect } from "vitest";
import { Cl } from "@stacks/transactions";

// checks that the trading status is correct

export const TradingEnabled = (accounts: Map<string, string>) => ({
  run: (model: Model, real: Simnet) => {
    console.log("TradingEnabled.run started");

    const result = real.callReadOnlyFn(
      "bonding-curve-dex",
      "get-tradable",
      [],
      accounts.values().next().value
    );

    console.log("get-tradable function called, result:", result.result);

    expect(result.result).toBeOk(Cl.bool(model.tradable));

    console.log("TradingEnabled.run completed");
  },
});