# Ramm EVM SDK

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

Welcome to the Ramm EVM SDK – your gateway to the exciting world of Ethereum Virtual Machine (EVM) interaction! 🚀 This comprehensive toolkit is your companion in developing mind-blowing Ethereum blockchain applications. With a blend of utilities, abstractions, and tools, we make the complex simple and the simple extraordinary.

## Transaction Functions

### liquidityDeposit

Dive into liquidity with the `liquidityDeposit` function! 💧 Users can seamlessly deposit a specified amount of a token, transformed into the smallest unit (wei), and greenlit before the deposit extravaganza.

#### Testing Data

To test the waters with `liquidityDeposit`:

1. Set the `tokenIn` index.
2. Define the `depositAmount`.
3. Provide a testing `signer`.
4. Specify the `pool` for testing.

### liquidityWithdrawal

Unleash the power of liquidity withdrawal with the `liquidityWithdrawal` function! 🌊 Specify the token, the amount of LP tokens to redeem, and let the magic happen.

#### Testing Data

To test `liquidityWithdrawal`:

1. Set the `tokenOut` index.
2. Define the `amountLPT` (LP token amount).
3. Specify the `pool` for testing.

### tradeGivenIn

Trade like never before with the `tradeGivenIn` function! 🔄 Provide the amount of a token entering the pool, set the inputs and outputs, and watch the blockchain symphony unfold.

#### Testing Data

To test `tradeGivenIn`:

1. Set the `tokenIn` and `tokenOut` indices.
2. Define the `tradeAmount` and `minAmountOut`.
3. Specify the `pool` for testing.

### tradeGivenOut

Flip the script with `tradeGivenOut`! 🎭 Perform a trade, specifying the amount of the token leaving the pool. Inputs, outputs, and a touch of blockchain magic.

#### Testing Data

To test `tradeGivenOut`:

1. Set the `tokenIn` and `tokenOut` indices.
2. Define the `tradeAmount` and `maxAmountIn`.
3. Specify the `pool` for testing.

### multipleLiquidityDeposit

Multiply your liquidity adventures with `multipleLiquidityDeposit`! 💰 Deposit liquidity for multiple assets simultaneously, creating a blockchain symphony of assets.

#### Testing Data

To test `multipleLiquidityDeposit`:

1. Define an array of `depositAmounts`.
2. Provide a testing `signer`.
3. Specify the `pool` for testing.

### multipleLiquidityWithdrawal

Dance through liquidity withdrawals with `multipleLiquidityWithdrawal`! 🕺 Withdraw liquidity for multiple tokens at once and experience the elegance of decentralized finance.

#### Testing Data

To test `multipleLiquidityWithdrawal`:

1. Define an array of `amountsLPT`.
2. Provide a testing `signer`.
3. Specify the `pool` for testing.

For an immersive dive into usage examples and detailed documentation, check out the [full documentation](link-to-your-documentation).

## Installation

```bash
npm install ramm-evm-sdk
```