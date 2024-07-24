import { Model } from "./types";
import { Simnet } from "@hirosystems/clarinet-sdk";
import { expect } from "vitest";
import { Cl } from "@stacks/transactions";

// checks that selling tokens works correctly, including STX payout and balance updates

export const SellTokens = (accounts: Map<string, string>) => ({
  run: (model: Model, real: Simnet, sender: string, tokensIn: bigint) => {
    console.log("SellTokens.run started");
    console.log("Sender:", sender);
    console.log("Tokens In:", tokensIn.toString());

    console.log("Current STX balance:", model.stxBalance.toString());
    console.log("Current token balance:", model.tokenBalance.toString());

    const k = model.tokenBalance * (model.stxBalance + model.virtualStxAmount);
    const newTokenBalance = model.tokenBalance + tokensIn;
    const newStxBalance = k / newTokenBalance - model.virtualStxAmount;
    const stxOut = model.stxBalance - newStxBalance - 1n; // - 1 as done in contract
    const stxFee = stxOut / 100n; // 1% fee
    const stxReceive = stxOut - stxFee;

    console.log("Calculated new STX balance:", newStxBalance.toString());
    console.log("Calculated STX out:", stxOut.toString());
    console.log("Calculated STX fee:", stxFee.toString());
    console.log("Calculated STX receive:", stxReceive.toString());

    console.log("Calling contract function");
    const result = real.callPublicFn(
      "bonding-curve-dex",
      "sell",
      [Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "welsh"), Cl.uint(tokensIn)],
      sender
    );
    console.log("Contract function called");

    const allowedDifference = 1n; // 1STX difference

    console.log("Contract result:", result);

    if (result.result.type === 7) { // OK 
      const actualStxReceive = BigInt(result.result.value.value);
      const difference = actualStxReceive > stxReceive ? actualStxReceive - stxReceive : stxReceive - actualStxReceive;

      console.log(`Expected STX receive: ${stxReceive}, Actual: ${actualStxReceive}, Difference: ${difference}`);

      expect(difference).toBeLessThanOrEqual(allowedDifference);

      model.stxBalance = newStxBalance;
      model.tokenBalance = newTokenBalance;
      model.userBalances.set(sender, (model.userBalances.get(sender) || 0n) - tokensIn);

      console.log("New STX balance:", model.stxBalance.toString());
      console.log("New token balance:", model.tokenBalance.toString());
    } else {
      console.error("Contract call failed:", result.result);
      throw new Error("Contract call failed");
    }

    console.log("SellTokens.run completed");
  },
});