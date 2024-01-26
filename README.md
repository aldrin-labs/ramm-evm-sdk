
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

## Example

### Trading

To execute a trade, you can use either **`tradeGivenIn`** for specifying the input amount or **`tradeGivenOut`** for specifying the output amount. Here is an example of trading a given input amount:

```javascript
import { tradeGivenIn } from 'ramm-sdk';
import BigNumber from 'bignumber.js';

const tokenInIndex = 0; // Index of the input token in the pool
const tokenOutIndex = 1; // Index of the output token in the pool
const amountIn = new BigNumber("1000000000000000000"); // 1 Token, assuming 18 decimal places
const minAmountOut = new BigNumber("100000000000000"); // Minimum acceptable output amount

await tradeGivenIn(
  tokenInIndex,
  tokenOutIndex,
  amountIn,
  minAmountOut,
  pool
);
```

### Adding Liquidity

To add liquidity to a RAMM pool, you can use the **`liquidityDeposit`** function for a single asset or **`multipleLiquidityDeposit`** for multiple assets:

```javascript
import { liquidityDeposit } from 'ramm-sdk';
import BigNumber from 'bignumber.js';

const tokenIndex = 0; // Index of the token you are depositing
const depositAmount = new BigNumber("1000000000000000000"); // Amount to deposit

await liquidityDeposit(
  tokenIndex,
  depositAmount,
  signer, // Your wallet client
  pool
);
```

### Withdrawing Liquidity

To withdraw liquidity, you can use the **`liquidityWithdrawal`** function. Here is an example of withdrawing liquidity in a single asset:

```javascript
import { liquidityWithdrawal } from 'ramm-sdk';
import BigNumber from 'bignumber.js';

const tokenIndex = 1; // Index of the token you are withdrawing
const amountLPT = new BigNumber("500000000000000000"); // Amount of LP tokens to redeem

await liquidityWithdrawal(
  tokenIndex,
  amountLPT,
  pool
);
```

### Retrieving Pool State

To get the current state of a RAMM pool, including the balances of its assets, LP tokens issued, and the latest prices from the price feeds:

```javascript
import { getPoolState } from 'ramm-sdk';

const poolState = await getPoolState(pool);
console.log(poolState);
```

## Conclusion

The RAMM SDK provides a simplified interface for developers to interact with RAMM pools, facilitating the integration of advanced trading and liquidity management functionalities into DApps. By following the setup and examples provided, developers can quickly begin building on top of RAMM pools.