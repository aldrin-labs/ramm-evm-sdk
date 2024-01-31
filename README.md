# ramm-sdk

## Introduction

This is the SDK for the RAMM EVM. It's designed to make it easier for developers to understand interact with the RAMM EVM.

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [Contributing](#contributing)
- [License](#license)

## Installation

To install this Ramm EVM SDK on your local machine, Follow these step:

```bash
    npm install ramm-evm-sdk
```

Ensures you have [Nodejs](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed

## Usage

```ts
import { parseGwei } from 'viem'; // import dependencies
import { liquidityWithdrawal, multipleLiquidityWithdrawal, RAMMPool } from '../index';
import { BigNumber } from 'bignumber.js'; // import dependencies

// New RAMM Pool
const pool = new RAMMPool(poolAddress, chainID, poolName, numberOfAssets, delta, baseFee, baseLeverage, protocolFee, publicClient, walletClient);

// Initialize
await pool.initialize(chain, transport);

// Perform liquidity deposit
await liquidityDeposit(tokenIndex, depositAmount, signer, pool);

// Perform liquidity withdrawal
await liquidityWithdrawal(tokenIndex, amountLPT, pool, toConvertToWei);

// Perform trade
await tradeGivenIn(tokenIn, tokenOut, tradeAmount, minAmountOut, pool, doConvertToWei);

// Perform trade
await tradeGivenOut(tokenIn, tokenOut, tradeAmount, maxAmountIn, signer, pool, doConvertToWei);
```

## License

Include information about the license [here](https://github.com/Abiodun1Omoogun/ramm-evm-sdk/tree/gib-bounty-YcUrk/LICENSE.txt).
