import { Model } from "./types";
import { Simnet } from "@hirosystems/clarinet-sdk";
import { expect } from "vitest";
import { Cl } from "@stacks/transactions";

// checks correct fees care collected

export const FeeCollection = (accounts: Map<string, string>) => ({
  run: (model: Model, real: Simnet, sender: string, stxAmount: bigint) => {
    console.log("FeeCollection.run started");

    const feeWallet = 'ST24JGYXDDK2W9S8B8XA2K7KJNA46F0S1G2Z5PT4Z';
    const expectedFee = stxAmount / 100n; // 1% fee 

    console.log("Calling buy function to check fee collection");
    const result = real.callPublicFn(
      "bonding-curve-dex",
      "buy",
      [Cl.contractPrincipal("ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM", "welsh"), Cl.uint(stxAmount)],
      sender
    );

    console.log("Buy function called, checking result");

    if (result.result.type === 7) { // OK
      const events = result.events;
      const feeTransferEvent = events.find(event => 
        event.event === 'stx_transfer_event' && 
        event.data.recipient === feeWallet
      );

      if (feeTransferEvent) {
        const actualFee = BigInt(feeTransferEvent.data.amount);
        console.log(`Expected fee: ${expectedFee}, Actual fee: ${actualFee}`);
        expect(actualFee).toBe(expectedFee);
      } else {
        throw new Error("Fee transfer event not found");
      }
    } else {
      console.error("Buy function call failed:", result.result);
      throw new Error("Buy function call failed");
    }

    console.log("FeeCollection.run completed");
  },
});