<div align="center">
  <img src="https://avatars.githubusercontent.com/u/60558183?s=200&v=4&width=500" alt="Logo" width="240">
  
  # Rebalancing Automated Market Maker (RAMM) EVM TypeScript SDK

  <p align="center">
    <br>
    This README provides an overview of the RAMM EVM TypeScript SDK, along with examples and documentation for its usage. Modify and extend the provided code according to your specific needs, and enjoy building with the Rebalancing AMM on Ethereum-based networks.
    <br />
    <br />
    <a href="https://discord.gg/aldrin">Discord</a>
  </p>
</div>

## Table Of Contents

  * [Features](#features)
    * [Installation](#installation)
    * [Examples](#examples)
      * [BalanceOf](#balanceof)
      * [CreateTrade](#createtrade)
      * [Deposit](#deposit)
      * [PoolState](#poolstate)
      * [Withdrawal](#withdrawal)

## Usage

```import { RAMMPool, liquidityDeposit, liquidityWithdrawal, tradeGivenIn, tradeGivenOut } from 'aldrin-labs/ramm-evm-sdk';

// Initialize RAMM Pool
const pool = new RAMMPool(poolAddress, chainID, poolName, numberOfAssets, delta, baseFee, baseLeverage, protocolFee, publicClient, walletClient);

// Initialize the pool contracts
await pool.initialize(chain, transport);

// Perform liquidity deposit
await liquidityDeposit(tokenIndex, depositAmount, signer, pool);

// Perform liquidity withdrawal
await liquidityWithdrawal(tokenIndex, amountLPT, pool, toConvertToWei);

// Perform trade (given amount in)
await tradeGivenIn(tokenIn, tokenOut, tradeAmount, minAmountOut, pool, doConvertToWei);

// Perform trade (given amount out)
await tradeGivenOut(tokenIn, tokenOut, tradeAmount, maxAmountIn, signer, pool, doConvertToWei);```

