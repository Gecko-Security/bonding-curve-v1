import { describe, it, expect } from "vitest";
import { BuyTokens } from "./invariants/BuyTokens";
import { SellTokens } from "./invariants/SellTokens";
import { PriceIncrease } from "./invariants/PriceIncrease";
import { PriceDecrease } from "./invariants/PriceDecrease";
import { LiquidityProvision } from "./invariants/LiquidityProvision";
import { TokenBurning } from "./invariants/TokenBurning";
import { FeeCollection } from "./invariants/FeeCollection";
import { TradingEnabled } from "./invariants/TradingEnabled";
import { BalanceChecks } from "./invariants/BalanceChecks";
import { ConstantProductInvariant } from "./invariants/ConstantProductInvariant";
import { Cl } from "@stacks/transactions";

describe("Bonding Curve DEX Invariant Tests", () => {
  it("executes all invariant operations", async () => {
    console.log("Test started");
    const accounts = simnet.getAccounts();
    console.log("Accounts fetched:", accounts);

    const testAccount = accounts.get('wallet_1');
    if (!testAccount) {
      throw new Error("Test account not found");
    }

    const model = {
      tradable: true,
      virtualStxAmount: 2000000000n,
      tokenBalance: 10000000000000000n,
      stxBalance: 0n,
      burnPercent: 20n,
      stxTargetAmount: 10000000000n,
      completeFee: 50000000n,
      userBalances: new Map(),
    };
    console.log("Model initialized:", model);

    const invariants = [
      { name: "BuyTokens", invariant: BuyTokens(accounts) },
      { name: "SellTokens", invariant: SellTokens(accounts) },
      { name: "PriceIncrease", invariant: PriceIncrease(accounts) },
      { name: "PriceDecrease", invariant: PriceDecrease(accounts) },
      { name: "LiquidityProvision", invariant: LiquidityProvision(accounts) },
      { name: "TokenBurning", invariant: TokenBurning(accounts) },
      { name: "FeeCollection", invariant: FeeCollection(accounts) },
      { name: "TradingEnabled", invariant: TradingEnabled(accounts) },
      { name: "BalanceChecks", invariant: BalanceChecks(accounts) },
      { name: "ConstantProductInvariant", invariant: ConstantProductInvariant(accounts) },
    ];

    const testStxAmount = 1000000000n; // 1000 STX
    const smallBuyAmount = 100000000n; // 100 STX (FeeCollection test)
    const largeBuyAmount = 5000000000n; // 5,000 STX (PriceIncrease test)
    const largeSellAmount = 500000000000000n; // 500,000,000,000,000 (PriceDecrease test)

    for (const { name, invariant } of invariants) {
      console.log(`Executing ${name} operation`);
      
      if ((name === "BuyTokens" || name === "SellTokens") && !model.tradable) {
        console.log(`Skipping ${name} operation as trading is disabled`);
        continue;
      }

      await new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error(`${name} operation timed out`));
        }, 5000); // 5 second

        try {
          switch (name) {
            case 'BuyTokens':
              invariant.run(model, simnet, testAccount, largeBuyAmount);
              break;
            case 'SellTokens':
              invariant.run(model, simnet, testAccount, testStxAmount);
              break;
            case 'PriceIncrease':
              invariant.run(model, simnet, testAccount, largeBuyAmount);
              break;
            case 'PriceDecrease':
              invariant.run(model, simnet, testAccount, largeSellAmount);
              break;
            case 'LiquidityProvision':
            case 'TokenBurning':
            case 'TradingEnabled':
              console.log("Current tradable status in model:", model.tradable);
              invariant.run(model, simnet);
              console.log("TradingEnabled invariant completed");
              break;
            case 'ConstantProductInvariant':
              console.log("Current model state before ConstantProductInvariant:", model);
              invariant.run(model, simnet);
              console.log("ConstantProductInvariant completed");
              break;
            case 'BalanceChecks':
              invariant.run(model, simnet, testAccount, testStxAmount, largeSellAmount);
              break;
            case 'FeeCollection':
              invariant.run(model, simnet, testAccount, smallBuyAmount);
              break;
            default:
              throw new Error(`Unknown invariant: ${name}`);
          }
          clearTimeout(timeout);
          resolve();
        } catch (error) {
          clearTimeout(timeout);
          reject(error);
        }
      });
      console.log(`${name} operation completed`);
    }

    console.log("Final model state:", model);

    expect(model.stxBalance).toBeGreaterThan(0n);
    expect(model.tokenBalance).toBeLessThan(10000000000000000n);

    console.log("Test completed successfully");
  });
});