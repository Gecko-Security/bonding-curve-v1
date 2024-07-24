import { Model } from "./types";
import { Simnet } from "@hirosystems/clarinet-sdk";
import { expect } from "vitest";


// ensures that constant product formula  (k=x*y) is true
export const ConstantProductInvariant = (accounts: Map<string, string>) => ({
  run: (model: Model, real: Simnet) => {
    console.log("ConstantProductInvariant.run started");

    const k = model.tokenBalance * (model.stxBalance + model.virtualStxAmount);

    const stxAmount = 1000000000n; // 1000STX
    const stxAfterFee = (stxAmount * 99n) / 100n;
    const newStxBalance = model.stxBalance + stxAfterFee + model.virtualStxAmount;
    const newTokenBalance = k / newStxBalance;

    const newK = newTokenBalance * newStxBalance;

    console.log("Initial k:", k.toString());
    console.log("New k:", newK.toString());
    console.log("Difference:", (k - newK).toString());

    // relative difference
    const relativeDifference = Math.abs(Number((k - newK) * 1000000n / k)) / 1000000;
    console.log("Relative difference:", relativeDifference);

    // small tolerance (e.g., 0.0001% or 1e-6)
    const tolerance = 1e-6;
    expect(relativeDifference).toBeLessThan(tolerance);

    console.log("ConstantProductInvariant.run completed");
  },
});