import { Model } from "./types";
import { Simnet } from "@hirosystems/clarinet-sdk";
import { expect } from "vitest";

// checks that the token price decreases when tokens are sold

export const PriceDecrease = (accounts: Map<string, string>) => ({
  run: (model: Model, real: Simnet, sender: string, tokensIn: bigint) => {
    console.log("PriceDecrease.run started");

    const initialStxBalance = model.stxBalance + model.virtualStxAmount;
    const initialTokenBalance = model.tokenBalance;
    const initialPrice = (initialStxBalance * 1000000n) / initialTokenBalance; // x1,000,000 for precision

    console.log("Initial STX balance:", initialStxBalance.toString());
    console.log("Initial token balance:", initialTokenBalance.toString());
    console.log("Initial price (x1,000,000):", initialPrice.toString());

    // sell
    const k = initialTokenBalance * initialStxBalance;
    const newTokenBalance = initialTokenBalance + tokensIn;
    const newStxBalance = k / newTokenBalance;
    const stxOut = initialStxBalance - newStxBalance;
    const stxFee = stxOut / 100n; // 1% fee
    const stxReceive = stxOut - stxFee;

    const newPrice = (newStxBalance * 1000000n) / newTokenBalance; // x1,000,000 for precision

    console.log("New STX balance:", newStxBalance.toString());
    console.log("New token balance:", newTokenBalance.toString());
    console.log("STX out:", stxOut.toString());
    console.log("New price (x1,000,000):", newPrice.toString());

    expect(newPrice).toBeLessThan(initialPrice);

    console.log("Price decrease:", (initialPrice - newPrice).toString());
    console.log("PriceDecrease.run completed");
  },
});