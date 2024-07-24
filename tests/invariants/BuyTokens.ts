import { Model } from "./types";
import { Simnet } from "@hirosystems/clarinet-sdk";
import { expect } from "vitest";
import { Cl } from "@stacks/transactions";

// checks that buying tokens works correctly including fee calculation and balance updates

export const BuyTokens = (accounts: Map<string, string>) => ({
  run: (model: Model, real: Simnet, sender: string, stxAmount: bigint) => {
    console.log("BuyTokens.run started");
    console.log("Sender:", sender);
    console.log("STX Amount:", stxAmount.toString());

    // expected tokens out and fees
    const stxAfterFee = (stxAmount * 99n) / 100n; // 1% fee
    console.log("STX after fee:", stxAfterFee.toString());

    const k = model.tokenBalance * (model.stxBalance + model.virtualStxAmount);
    console.log("k value:", k.toString());

    const newStxBalance = model.stxBalance + stxAfterFee + model.virtualStxAmount;
    console.log("New STX balance:", newStxBalance.toString());

    const newTokenBalance = k / newStxBalance;
    console.log("New token balance:", newTokenBalance.toString());

    const tokensOut = model.tokenBalance - newTokenBalance;
    console.log("Tokens out:", tokensOut.toString());

    // simulate the buy transaction
    console.log("Calling contract function");
    const result = real.callPublicFn(
      "bonding-curve-dex",
      "buy",
      [Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "welsh"), Cl.uint(stxAmount)],
      sender
    );
    console.log("Contract function called");

    // assert the transaction was successful
    console.log("Asserting result");
    expect(result.result).toBeOk(Cl.uint(tokensOut));
    console.log("Assertion passed");

    console.log("Updating model");
    model.stxBalance += stxAfterFee;
    model.tokenBalance -= tokensOut;
    model.userBalances.set(sender, (model.userBalances.get(sender) || 0n) + tokensOut);

    // check if target is reached
    if (model.stxBalance >= model.stxTargetAmount) {
      model.tradable = false;
      console.log("Target reached, trading disabled");
    }

    console.log("BuyTokens.run completed");
  },
});