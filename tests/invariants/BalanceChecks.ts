import { Model } from "./types";
import { Simnet } from "@hirosystems/clarinet-sdk";
import { expect } from "vitest";
import { Cl } from "@stacks/transactions";

// checks users cant buy or sell tokens without sufficent balance

export const BalanceChecks = (accounts: Map<string, string>) => ({
  run: (model: Model, real: Simnet, sender: string, stxAmount: bigint, tokensAmount: bigint) => {
    console.log("BalanceChecks.run started");

    const userStxBalance = model.stxBalance; 
    const userTokenBalance = model.userBalances.get(sender) || 0n;

    console.log("User STX balance:", userStxBalance.toString());
    console.log("User token balance:", userTokenBalance.toString());

    // check buy
    if (stxAmount > userStxBalance) {
      console.log("Attempting to buy with insufficient STX balance");
      const result = real.callPublicFn(
        "bonding-curve-dex",
        "buy",
        [Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "welsh"), Cl.uint(stxAmount)],
        sender
      );
      expect(result.result.type).toBe(8); // expect error
    } else {
      console.log("STX balance is sufficient for buy");
    }

    // check sell
    if (tokensAmount > userTokenBalance) {
      console.log("Attempting to sell with insufficient token balance");
      const result = real.callPublicFn(
        "bonding-curve-dex",
        "sell",
        [Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "welsh"), Cl.uint(tokensAmount)],
        sender
      );
      expect(result.result.type).toBe(8); // expect error
    } else {
      console.log("Token balance is sufficient for sell");
    }

    console.log("BalanceChecks.run completed");
  },
});