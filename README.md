# RAMM SDK for EVM Chains

## Introduction

The RAMM SDK for EVM Chains, short for Rebalancing Automated Market Maker, is a sophisticated TypeScript library designed for Ethereum Virtual Machine (EVM) chains. It equips developers with advanced tools to efficiently engage in automated market-making, liquidity management, and smart contract interactions on various EVM-compatible blockchains. Tailored for decentralized finance (DeFi) applications, the SDK streamlines the process of creating dynamic trading strategies, managing liquidity pools, and interacting with a range of DeFi protocols. By simplifying complex blockchain operations, the RAMM SDK is an indispensable


## Features

- **Advanced Trading Operations**: Facilitate various trading operations like `tradeGivenIn` and `tradeGivenOut`, providing flexibility in trading strategies.
- **Liquidity Management**: Enable easy liquidity management through methods like `liquidityDeposit`, `liquidityWithdrawal`, `multipleLiquidityDeposit`, and `multipleLiquidityWithdrawal`.
- **Smart Contract Interaction**: Simplify interactions with EVM smart contracts using methods like `callERC20Token` and `approve`.
- **Pool State Management**: Offer functionalities to manage and retrieve the state of liquidity pools using methods like `getPoolState`.
- **Easy Initialization**: Provide straightforward initialization of the SDK and pool setup with `initialize` and `initializeWithData`.
- **Flexible Configuration**: Support various network configurations and custom setups, enhancing the SDK's adaptability to different blockchain environments.
- **Developer-Friendly Environment**: The usage code demonstrates the SDK's integration with other libraries and tools, highlighting its compatibility and ease of use in diverse development scenarios.


## Getting Started

### Prerequisites
- Node.js
- npm or yarn

### Installation
To install the RAMM SDK, run the following command in your project directory:

- Installing via `npm`:
```bash
npm install @aldrin-labs/ramm-evm-sdk
```
- Installing via `yarn`:
```bash
yarn add @aldrin-labs/ramm-evm-sdk
```

## Usage

To utilize the RAMM SDK in your project, start by importing the required components. Here is a simplified example to demonstrate the basic setup:

```typescript
import { RAMMPool, liquidityDeposit, tradeGivenIn } from '@aldrin-labs/ramm-evm-sdk';
import { BigNumber } from 'bignumber.js';

// Example: Setting up a RAMM Pool
const poolAddress = "YOUR_POOL_ADDRESS";
const chainID = YOUR_CHAIN_ID; // Replace with your chain ID
const poolName = "YOUR_POOL_NAME";
const numberOfTokens = 2; // Number of tokens in your pool
const delta = 0.3; // Example delta value
const baseFee = 0.01; // Example base fee
const baseLeverage = 3; // Example base leverage
const protocolFee = 0.005; // Example protocol fee

const pool = new RAMMPool(
  poolAddress,
  chainID,
  poolName,
  numberOfTokens,
  delta,
  baseFee,
  baseLeverage,
  protocolFee
);

```
## Contributing
Follow our [Contribution Guidelines](#) to get started & submit [Pull requests](https://github.com/aldrin-labs/ramm-evm-sdk/pulls)


## Issues
[Report issues, bugs, or request features on our Issue Tracker.](https://github.com/aldrin-labs/ramm-evm-sdk/issues/new) 

## Changelog
Refer to the [Changelog](https://github.com/aldrin-labs/ramm-evm-sdk/releases) for details on each release.

## Support and Community
Join our community on [Discord](https://discord.gg/4VZyNxT2WU) for support and discussion.


