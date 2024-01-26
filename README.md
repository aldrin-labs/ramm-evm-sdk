
# RAMM SDK Documentation

The RAMM SDK is a comprehensive toolkit designed for developers to interact with RAMM (Risk-Adjusted Market Maker) pools on the blockchain. This SDK simplifies the process of integrating RAMM functionalities into decentralized applications (DApps), allowing for operations such as trading, liquidity provision, and retrieval of pool states.

## Features

* **Trade Execution**: Perform trades given in or out amounts.
* **Liquidity Management**: Deposit or withdraw liquidity in single or multiple assets.
* **Pool Interaction**: Retrieve the state of RAMM pools, including balances, LP tokens, and prices.
* **Utility Functions**: Includes various utility functions for data conversion and message parsing.

## Installation

To use the RAMM SDK in your project, you will need to install it via npm or yarn:

```bash
npm install ramm-sdk
# or
yarn add ramm-sdk

```

## Setup

Before you can interact with RAMM pools, you must initialize the SDK with your blockchain provider and signer information. The following example demonstrates how to set up the SDK for use on the Polygon network:

```javascript
import { RAMMPool, networkConfig, SupportedNetworks } from 'ramm-sdk';
import { ethers } from 'ethers';

// Initialize your Ethereum provider and signer
const provider = new ethers.providers.JsonRpcProvider(process.env.POLYGON_RPC_URL);
const signer = provider.getSigner();

// Define the RAMM pool you want to interact with
const polygonConfig = networkConfig[SupportedNetworks.matic];
const poolConfig = polygonConfig.poolList[0];

const pool = new RAMMPool(
  poolConfig.poolAddress,
  poolConfig.chainID,
  poolConfig.poolName,
  poolConfig.numberOfTokens,
  poolConfig.delta,
  poolConfig.baseFee,
  poolConfig.baseLeverage,
  poolConfig.protocolFee,
  provider, // Public client
  signer // Wallet client for transactions
);

```