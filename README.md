# ramm-sdk

<div align="center">
  <img height="170x" src="https://pbs.twimg.com/profile_images/1663222561566789632/Q2Wo01dy_400x400.png" />

  <h1>RAMM</h1>

  <p>
    <strong>Rebalancing Automated Market Maker (RAMM) EVM SDK</strong>
  </p>

  <p>
    <a href="https://github.com/aldrin-labs/ramm-evm-sdk/actions"><img alt="Build Status" src="https://github.com/coral-xyz/anchor/actions/workflows/tests.yaml/badge.svg" /></a>
    <a href="https://docs.aldrin.com/"><img alt="Tutorials" src="https://img.shields.io/badge/docs-tutorials-blueviolet" /></a>
    <a href="https://discord.gg/aldrin"><img alt="Discord Chat" src="https://img.shields.io/discord/889577356681945098?color=blueviolet" /></a>
  </p>

[![Twitter](https://img.shields.io/badge/follow-%40HelloTelos-834e9f?logo=X&style=for-the-badge)](https://x.com/hellotelos)

</div>

## Table Of Contents

1. [Installation](#installation)
2. [Usage](#usage)
3. [API Reference](#api-reference)
4. [Example](#example)
5. [Contributing](#contributing)
6. [License](#license)
7. [Issues](#issues)
8. [Changelog](#changelog)

## Installation

- Installing via `npm`:

```shell
npm install @aldrin-labs/ramm-evm-sdk
```

- Installing via `yarn`:

```shell
yarn add @aldrin-labs/ramm-evm-sdk
```

## Usage

```typescript
import {
  RAMMPool,
  liquidityDeposit,
  liquidityWithdrawal,
  tradeGivenIn,
  tradeGivenOut,
  multipleLiquidityWithdrawal,
  networkConfig,
  SupportedNetworks,
} from "@aldrin-labs/ramm-evm-sdk";

import { BigNumber } from "bignumber.js";

import { createWalletClient, http, publicActions } from "viem";
import { polygon } from "wagmi/chains";
import { createConfig, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";
import { infuraProvider } from "wagmi/providers/infura";
import { privateKeyToAccount } from "viem/accounts";

require("dotenv").config();

const { publicClient, webSocketPublicClient } = configureChains(
  [polygon],
  [
    infuraProvider({ apiKey: process.env.INFURA_API_KEY as string }),
    publicProvider(),
  ]
);

createConfig({
  publicClient,
  webSocketPublicClient,
});

const signer_account = privateKeyToAccount(process.env.PRIVATE_KEY);

const walletClient = createWalletClient({
  account: signer_account,
  chain: polygon,
  transport: http(),
}).extend(publicActions); // ts-ignore-line

// New RAMM Pool
const polygonConfig = networkConfig[SupportedNetworks.matic];
const poly_ramm = polygonConfig.poolList[0];
const pool = new RAMMPool(
  poly_ramm.poolAddress,
  poly_ramm.chainID,
  poly_ramm.poolName,
  poly_ramm.numberOfTokens,
  poly_ramm.delta,
  poly_ramm.baseFee,
  poly_ramm.baseLeverage,
  poly_ramm.protocolFee,
  walletClient
);
```

## API Reference

### RAMMPool

#### Properties

- name: string
- address: string
- chainID: number
- n: number
- client: any
- walletClient: any
- assetsAddresses: string[]
- LPTokenAddresses: string[]
- priceFeedAddresses: string[]
- rammContract: any
- assetsDecimalPlaces: number[]
- LPTokensDecimalPlaces: number[]
- priceFeedsDecimalPlaces: number[]
- LPTokensList: string[]
- assetsList: string[]
- delta, baseFee, baseLeverage, protocolFee: number
- rammParams: object
- PriceFeedContractsList, LPTokenContractsList, tokenContractsList: any[]

#### Methods

- initialize(chain: any, transport?: any): Promise<void>
- initializeWithData(data: poolData): void
- callERC20Token(tokenContractAddress: string, functionName: string, args?: any, params?: any): Promise<any>
- approve(tokenSymbol: string, address: string, amount: BigNumber, gasPrice: any): Promise<any>
- liquidity_deposit(tokenIndex: number, amount: string, gasPrice: any): Promise<any>
- liquidity_withdrawal(tokenOut: number, amount: string, gasPrice: any): Promise<any>
- trade_amount_in(tokenIn: number, tokenOut: number, amountIn: string, minAmount: string, gasPrice: any): Promise<any>
- trade_amount_out(tokenIn: number, tokenOut: number, amountOut: string, maxAmount: string, gasPrice: any): Promise<any>
- getPoolState(): Promise<PoolState>

### Transactions

#### Methods

- [liquidityDeposit](#Deposit-Into-A-Pool)
- [multipleLiquidityDeposit](#Deposit-Into-A-Pool)
- [liquidityWithdrawal](#Withdraw-From-A-Pool)
- [multipleLiquidityWithdrawal](#Withdraw-From-A-Pool)
- [tradeGivenIn](#Create-A-trade)
- [tradeGivenOut](#Create-A-trade)

## Example

### Initializing Pool

```typescript
// configuration code ...
// ....

async function main() {
  /**
   * @dev simple initializing
   * */
  await pool.initialize(polygon);
  const poolState = await getPoolState(pool);
  console.info("Pool state", poolState);

  /**
   * @dev initializing with custom pool config
   * */
  const configData = networkConfig[SupportedNetworks.matic]
    .poolList[0] as poolConfigurationData;
}

void main();
```

### Get Pool Balance

```typescript
// configuration code ...
// ....

async function main() {
  const configData = networkConfig[SupportedNetworks.matic]
    .poolList[0] as poolConfigurationData;
  await pool.initializeWithData(configData.tokensData);
  console.info("LP state:", pool.address);
  const LPAmounts = await getLPTokensAmounts(signer_account.address, [pool]);
  console.info("LP amounts:", LPAmounts);
}

void main();
```

### Get User Balance

```typescript
// configuration code ...
// ....

async function main() {
  await pool.initialize(polygon);
  console.info("LP state:", pool.address);
  const balances = await getWalletBalances(signer_account.address, pool);
  console.info("User balance:", balances);
}

void main();
```

### Create A trade

```typescript
// configuration code ...
// ....

// -> adding this
import { fetchBalance } from "@wagmi/core";

// For example: 1 wmatic = 0.0003648 eth
const wmatic_amount_in = new BigNumber("1000000000000000000", 10);
// For example: The current price is 3648, but set it lower to make the test ran
const min_weth_amount_out = new BigNumber("264800000000000000", 10);
const tokenIn = 0;
const tokenOut = 1;

/**
 * @dev tradeGivenIn
 * @example gives WMATIC and returns WETH
 * */
(async () => {
  console.info("tradeGivenIn...");
  await pool.initialize(polygon);
  const oldBalance = await fetchBalance({
    address: `0x${signer_account.address.replace("0x", "")}`,
    token: `0x${poly_ramm.tokensData.assetsAddresses[tokenOut].replace(
      "0x",
      ""
    )}`,
    chainId: poly_ramm.chainID,
  });

  console.log("Current balance:", oldBalance.value);
  // passing tokenIn is WMATIC, tokenOut is WETH
  const trade = await tradeGivenIn(
    tokenIn,
    tokenOut,
    wmatic_amount_in,
    min_weth_amount_out,
    pool,
    false
  );
  console.info("Trade result:", trade);

  const newBalance = await fetchBalance({
    address: `0x${signer_account.address.replace("0x", "")}`,
    token: `0x${poly_ramm.tokensData.assetsAddresses[tokenOut].replace(
      "0x",
      ""
    )}`,
    chainId: poly_ramm.chainID,
  });
  console.info("New balance:", newBalance.value);
})();

/**
 * @dev tradeGivenOut
 * @example gives WETH and returns WMATIC
 * */
(async () => {
  await pool.initialize(poly_ramm.chainID);
  const oldBalance = await fetchBalance({
    address: `0x${signer_account.address.replace("0x", "")}`,
    token: `0x${poly_ramm.tokensData.assetsAddresses[tokenOut].replace(
      "0x",
      ""
    )}`,
    chainId: poly_ramm.chainID,
  });
  console.info("Current balance:", oldBalance.value);

  // passing tokenIn is WETH, tokenOut is WMATIC
  const trade = await tradeGivenOut(
    tokenIn,
    tokenOut,
    min_weth_amount_out,
    wmatic_amount_in,
    walletClient,
    pool,
    false
  );
  console.info("Trade result:", trade);

  const newBalance = await fetchBalance({
    address: `0x${signer_account.address.replace("0x", "")}`,
    token: `0x${poly_ramm.tokensData.assetsAddresses[tokenOut].replace(
      "0x",
      ""
    )}`,
    chainId: poly_ramm.chainID,
  });
  console.info("New balance:", newBalance.value);
})();
```

### Deposit Into A Pool

```typescript
// configuration code ...
// ....

// ~= 0.0001148 WETH
const weth_amount_deposit = new BigNumber("114800000000000", 10);
// ~= 0.0001148 WMATIC
const wmatic_amount_deposit = new BigNumber("114800000000000", 10);
// ~= 0.0001148 USDC
const usdc_amount_deposit = new BigNumber("114800000000000", 10);
// ~= 0.0001148 USDT
const usdt_amount_deposit = new BigNumber("114800000000000", 10);
// WETH 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619
const WETH_INDEX = 1;

/**
 * @dev liquidityDeposit
 * @description Deposit single token
 *
 * */
async () => {
  await pool.initialize(polygon);
  const oldBalance = await fetchBalance({
    address: `0x${signer_account.address.replace("0x", "")}`,
    token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace(
      "0x",
      ""
    )}`,
    chainId: poly_ramm.chainID,
  });
  console.info("Current balance:", oldBalance.value);

  const depositResult = await liquidityDeposit(
    WETH_INDEX,
    weth_amount_deposit,
    walletClient,
    pool,
    false
  );
  console.info("depositResult", depositResult);

  // sleep for 30s to wait for blockchain block, transaction confirmation
  await new Promise((r) => setTimeout(r, 30000));

  const newBalance = await fetchBalance({
    address: `0x${signer_account.address.replace("0x", "")}`,
    token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace(
      "0x",
      ""
    )}`,
    chainId: poly_ramm.chainID,
  });

  console.info("New balance:", newBalance.value);
};

/**
 * @dev multipleLiquidityDeposit
 * @description Deposit multiple tokens
 *
 * */
async () => {
  await pool.initialize(polygon);
  const oldBalance = await fetchBalance({
    address: `0x${signer_account.address.replace("0x", "")}`,
    token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace(
      "0x",
      ""
    )}`,
    chainId: poly_ramm.chainID,
  });
  console.info("Current balance:", oldBalance.value);

  const depositResult = await multipleLiquidityDeposit(
    [
      wmatic_amount_deposit,
      weth_amount_deposit,
      usdc_amount_deposit,
      usdt_amount_deposit,
    ],
    walletClient,
    pool
  );
  console.info("Deposit result:", depositResult);

  // sleep for 30s to wait for blockchain block, transaction confirmation
  await new Promise((r) => setTimeout(r, 30000));

  const newBalance = await fetchBalance({
    address: `0x${signer_account.address.replace("0x", "")}`,
    token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace(
      "0x",
      ""
    )}`,
    chainId: poly_ramm.chainID,
  });

  console.info("New balance:", newBalance.value);
};
```

### Withdraw From A Pool

```typescript
// configuration code ...
// ....

// ~= 0.002648 WETH
const LPweth_amount_withdraw = new BigNumber("1148000000000000", 10);
// ~= 0.002648 WMATIC
const LPwmatic_amount_withdraw = new BigNumber("1148000000000000", 10);
// ~= 0.002648 USDC
const LPusdc_amount_withdraw = new BigNumber("1148000000000000", 10);
// ~= 0.002648 USDt
const LPusdt_amount_withdraw = new BigNumber("1148000000000000", 10);
// WETH 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619
const WETH_INDEX = 1;

/**
 * @dev liquidityWithdrawal
 * @description Withdraw from a pool
 *
 * */
async () => {
  await pool.initialize(polygon);
  const oldBalance = await fetchBalance({
    address: `0x${signer_account.address.replace("0x", "")}`,
    token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace(
      "0x",
      ""
    )}`,
    chainId: poly_ramm.chainID,
  });
  console.info("Current balance:", oldBalance.value);

  const withdrawalResult = await liquidityWithdrawal(
    WETH_INDEX,
    LPweth_amount_withdraw,
    pool,
    false
  );
  console.info("Withdrawal result", withdrawalResult);

  // sleep for 30s to wait for blockchain block, transaction confirmation
  await new Promise((r) => setTimeout(r, 30000));

  const newBalance = await fetchBalance({
    address: `0x${signer_account.address.replace("0x", "")}`,
    token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace(
      "0x",
      ""
    )}`,
    chainId: poly_ramm.chainID,
  });

  console.info("New balance:", newBalance.value);
};

/**
 * @dev multipleLiquidityWithdrawal
 * @description Deposit multiple tokens
 *
 * */
async () => {
  await pool.initialize(polygon);
  const oldBalance = await fetchBalance({
    address: `0x${signer_account.address.replace("0x", "")}`,
    token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace(
      "0x",
      ""
    )}`,
    chainId: poly_ramm.chainID,
  });
  console.info("Current balance:", oldBalance.value);

  const withdrawalResult = await multipleLiquidityWithdrawal(
    [
      LPwmatic_amount_withdraw,
      LPweth_amount_withdraw,
      LPusdc_amount_withdraw,
      LPusdt_amount_withdraw,
    ],
    walletClient,
    pool,
    false
  );
  console.info("Deposit result:", withdrawalResult);

  // sleep for 30s to wait for blockchain block, transaction confirmation
  await new Promise((r) => setTimeout(r, 30000));

  const newBalance = await fetchBalance({
    address: `0x${signer_account.address.replace("0x", "")}`,
    token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace(
      "0x",
      ""
    )}`,
    chainId: poly_ramm.chainID,
  });

  console.info("New balance:", newBalance.value);
};
```

## Issues

[Report issues, bugs, or request features on our Issue Tracker.](https://github.com/aldrin-labs/ramm-evm-sdk/issues)
