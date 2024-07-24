import { Model } from "./types";
import { Simnet } from "@hirosystems/clarinet-sdk";
import { expect } from "vitest";

export const PriceIncrease = (accounts: Map<string, string>) => ({
  run: (model: Model, real: Simnet, sender: string, stxAmount: bigint) => {
    console.log("PriceIncrease.run started");

    const initialStxBalance = model.stxBalance + model.virtualStxAmount;
    const initialTokenBalance = model.tokenBalance;
    const initialPrice = (initialStxBalance * 1000000n) / initialTokenBalance; // Multiply by 1,000,000 for precision

    console.log("Initial STX balance:", initialStxBalance.toString());
    console.log("Initial token balance:", initialTokenBalance.toString());
    console.log("Initial price (x1,000,000):", initialPrice.toString());

    // Simulate a buy
    const stxAfterFee = (stxAmount * 99n) / 100n; // 1% fee
    const k = initialTokenBalance * initialStxBalance;
    const newStxBalance = initialStxBalance + stxAfterFee;
    const newTokenBalance = k / newStxBalance;
    const tokensOut = initialTokenBalance - newTokenBalance;

    const newPrice = (newStxBalance * 1000000n) / newTokenBalance; // Multiply by 1,000,000 for precision

    console.log("New STX balance:", newStxBalance.toString());
    console.log("New token balance:", newTokenBalance.toString());
    console.log("Tokens out:", tokensOut.toString());
    console.log("New price (x1,000,000):", newPrice.toString());

    expect(newPrice).toBeGreaterThan(initialPrice);

    console.log("Price increase:", (newPrice - initialPrice).toString());
    console.log("PriceIncrease.run completed");
  },
});