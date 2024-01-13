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
  * [Installation](#installation)
    * [Examples](#examples)
        
      * [NewPool](#new-pool)
      * [PoolBalance](#Pool-Balance)
      * [CreateTrade](#create-trade)
      * [Deposit](#Deposit-into-a-Pool)
      * [Withdrawal](#Withdraw-from-a-Pool)
     
## Installation
```npm install @aldrin-labs/ramm-evm-sdk```

## Usage

```import { RAMMPool, liquidityDeposit, liquidityWithdrawal, tradeGivenIn, tradeGivenOut } from '@aldrin-labs/ramm-evm-sdk';
import { parseGwei } from 'viem'; // import dependencies
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
# Examples

### New Pool
```
import { SupportedNetworks } from '../src/constants';
import { createWalletClient, http, publicActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'

const network = SupportedNetworks.matic;

// Retrieve pool configuration
const poolConfig = networkConfig[network].poolList[0]; // Assuming only one pool in the example

const signer_account = privateKeyToAccount(process.env.PRIVATE_KEY)
console.log(signer_account.address, signer_account.publicKey)

const walletClient = createWalletClient({
  account: signer_account,
  chain: polygon,
  transport: http()
}).extend(publicActions); // ts-ignore-line

// Initialize the pool
const pool = new RAMMPool(
  poolConfig.poolAddress,
  poolConfig.chainID,
  poolConfig.poolName,
  poolConfig.numberOfTokens,
  poolConfig.delta,
  poolConfig.baseFee,
  poolConfig.baseLeverage,
  poolConfig.protocolFee,
  walletClient, 
);

```

### Pool Balance
```import { RAMMPool } from '../index';
import { getWalletBalances, getLPTokensAmounts } from '../src/interface';
import BigNumber from 'bignumber.js';
import { networkConfig } from '../index';
import { SupportedNetworks } from '../src/constants';
import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { fetchBalance } from '@wagmi/core';
import { infuraProvider } from 'wagmi/providers/infura';

// Set up environment and configuration
require('dotenv').config();
const signer_account = privateKeyToAccount(process.env.PRIVATE_KEY);
const walletClient = createWalletClient({
  account: signer_account,
  chain: SupportedNetworks.matic, // Change to your network
  transport: http(),
}).extend(publicActions);

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

// Example: Get LP token balances
(async () => {
  await pool.initializeWithData(poly_ramm.tokensData);
  const LPAmounts = await getLPTokensAmounts(signer_account.address, [pool]);
  console.log('LP Token amounts:', LPAmounts);
})();

// Example: Get asset balances for a user in a pool
(async () => {
  await pool.initialize(pool.chain);
  const balances = await getWalletBalances(signer_account.address, pool);
  console.log('Asset balances:', balances);
})();

```

### Create Trade
```import { tradeGivenIn, tradeGivenOut, RAMMPool } from '../index';
import { getOutputTradeIn, getOutputTradeOut, getPoolState, TradeParamsBN } from '../src/interface';
import BigNumber from 'bignumber.js';
import { networkConfig } from '../index';
import { SupportedNetworks } from '../src/constants';
import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { fetchBalance } from '@wagmi/core';
import { infuraProvider } from 'wagmi/providers/infura';

// Set up environment and configuration
require('dotenv').config();
const signer_account = privateKeyToAccount(process.env.PRIVATE_KEY);
const walletClient = createWalletClient({
  account: signer_account,
  chain: SupportedNetworks.matic, // Change to your network
  transport: http(),
}).extend(publicActions);

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

const wmatic_amount_in = new BigNumber("1000000000000000000", 10); // 1 wmatic = 0.0003648 eth
const min_weth_amount_out = new BigNumber("264800000000000000", 10); // current price is 3648, but made it lower to pass the test
const tokenIn = 0;
const tokenOut = 1;

// Example: TradeGivenIn
(async () => {
  await pool.initialize(poly_ramm.chainID);
  const oldBalance = await fetchBalance({
    address: `0x${signer_account.address.replace('0x', '')}`,
    token: `0x${poly_ramm.tokensData.assetsAddresses[tokenOut].replace('0x', '')}`,
    chainId: poly_ramm.chainID,
  });
  const trade = await tradeGivenIn(tokenIn, tokenOut, wmatic_amount_in, min_weth_amount_out, pool, false);
  const newBalance = await fetchBalance({
    address: `0x${signer_account.address.replace('0x', '')}`,
    token: `0x${poly_ramm.tokensData.assetsAddresses[tokenOut].replace('0x', '')}`,
    chainId: poly_ramm.chainID,
  });
  console.log('Trade details:', trade);
  console.log('New balance:', newBalance.value);
})();

// Example: TradeGivenOut
(async () => {
  await pool.initialize(poly_ramm.chainID);
  const oldBalance = await fetchBalance({
    address: `0x${signer_account.address.replace('0x', '')}`,
    token: `0x${poly_ramm.tokensData.assetsAddresses[tokenOut].replace('0x', '')}`,
    chainId: poly_ramm.chainID,
  });
  const trade = await tradeGivenOut(tokenIn, tokenOut, min_weth_amount_out, wmatic_amount_in, walletClient, pool, false);
  const newBalance = await fetchBalance({
    address: `0x${signer_account.address.replace('0x', '')}`,
    token: `0x${poly_ramm.tokensData.assetsAddresses[tokenOut].replace('0x', '')}`,
    chainId: poly_ramm.chainID,
  });
  console.log('Trade details:', trade);
  console.log('New balance:', newBalance.value);
})();
```

### Deposit into a Pool
```import {
    liquidityDeposit,
    multipleLiquidityDeposit,
    RAMMPool,
} from '../index';
import BigNumber from 'bignumber.js'
import { networkConfig } from '../index';

import { describe, expect, test } from 'vitest';
import { SupportedNetworks } from '../src/constants';
import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { fetchBalance } from '@wagmi/core';
import { infuraProvider } from 'wagmi/providers/infura';

// Set up environment and configuration
require('dotenv').config();
const signer_account = privateKeyToAccount(process.env.PRIVATE_KEY);
const walletClient = createWalletClient({
    account: signer_account,
    chain: SupportedNetworks.matic, // Change to your network
    transport: http(undefined, { timeout: 420_000 })
}).extend(publicActions);

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
    walletClient,
    walletClient
);

const weth_amount_deposit = new BigNumber("114800000000000", 10); // ~= 0.0001148 WETH
const wmatic_amount_deposit = new BigNumber("114800000000000", 10); // ~= 0.0001148 WMATIC
const usdc_amount_deposit = new BigNumber("114800000000000", 10); // ~= 0.0001148 USDC
const usdt_amount_deposit = new BigNumber("114800000000000", 10); // ~= 0.0001148 USDt

const WETH_INDEX = 1; // WETH 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619

describe('polygon ramm deposit to pool', () => {
    test('add WETH', async () => {
        await pool.initialize(polygon);
        const oldBalance = await fetchBalance({
            address: `0x${signer_account.address.replace('0x', '')}`,
            token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace('0x', '')}`,
            chainId: poly_ramm.chainID,
        });

        const depositResult = await liquidityDeposit(WETH_INDEX, weth_amount_deposit, walletClient, pool, false);
        console.log('depositResult', depositResult);

        await new Promise(r => setTimeout(r, 30000));

        const newBalance = await fetchBalance({
            address: `0x${signer_account.address.replace('0x', '')}`,
            token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace('0x', '')}`,
            chainId: poly_ramm.chainID,
        });

        console.log('balances', newBalance.value, oldBalance.value);
        expect(newBalance.value).toBeLessThan(oldBalance.value);
    }, 150000);

    test('multideposit WETH, WMATIC, USDC, USDT', async () => {
        await pool.initialize(polygon);

        const oldBalance = await fetchBalance({
            address: `0x${signer_account.address.replace('0x', '')}`,
            token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace('0x', '')}`,
            chainId: poly_ramm.chainID,
        });

        const depositResult = await multipleLiquidityDeposit(
            [wmatic_amount_deposit, weth_amount_deposit, usdc_amount_deposit, usdt_amount_deposit],
            walletClient, pool);
        console.log('depositResult', depositResult);

        await new Promise(r => setTimeout(r, 30000));

        const newBalance = await fetchBalance({
            address: `0x${signer_account.address.replace('0x', '')}`,
            token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace('0x', '')}`,
            chainId: poly_ramm.chainID,
        });

        console.log('balances', newBalance.value, oldBalance.value);
        expect(newBalance.value).toBeGreaterThan(oldBalance.value);
    });
});
```

### Withdraw from a Pool
```
import {
    liquidityWithdrawal,
    multipleLiquidityWithdrawal,
    RAMMPool,
} from '../index';
import BigNumber from 'bignumber.js'
import { networkConfig } from '../index';

import { describe, expect, test } from 'vitest';
import { SupportedNetworks } from '../src/constants';
import { createWalletClient, http, publicActions } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { fetchBalance } from '@wagmi/core';
import { infuraProvider } from 'wagmi/providers/infura';

// Set up environment and configuration
require('dotenv').config();
const signer_account = privateKeyToAccount(process.env.PRIVATE_KEY);
const walletClient = createWalletClient({
    account: signer_account,
    chain: SupportedNetworks.matic,
    transport: http()
}).extend(publicActions);

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

const LPweth_amount_withdraw = new BigNumber("1148000000000000", 10); // ~= 0.002648 WETH
const LPwmatic_amount_withdraw = new BigNumber("1148000000000000", 10); // ~= 0.002648 WMATIC
const LPusdc_amount_withdraw = new BigNumber("1148000000000000", 10); // ~= 0.002648 USDC
const LPusdt_amount_withdraw = new BigNumber("1148000000000000", 10); // ~= 0.002648 USDt

const WETH_INDEX = 1; // WETH 0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619

describe('polygon ramm withdraw from pool', () => {
    test('withdraw WETH', async () => {
        await pool.initialize(polygon);
        const oldBalance = await fetchBalance({
            address: `0x${signer_account.address.replace('0x', '')}`,
            token: `0x${poly_ramm.tokensData.lptokensAddresses[WETH_INDEX].replace('0x', '')}`,
            chainId: poly_ramm.chainID,
        });

        const withdrawalResult = await liquidityWithdrawal(WETH_INDEX, LPweth_amount_withdraw, pool, false);
        console.log('withdrawalResult', withdrawalResult, false);

        await new Promise(r => setTimeout(r, 30000));

        const newBalance = await fetchBalance({
            address: `0x${signer_account.address.replace('0x', '')}`,
            token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace('0x', '')}`,
            chainId: poly_ramm.chainID,
        });

        console.log('balances', newBalance.value, oldBalance.value);
        expect(newBalance.value).toBeGreaterThan(oldBalance.value);
    }, 50000);

    test('multideposit WETH, WMATIC, USDC, USDT', async () => {
        await pool.initialize(polygon);

        const oldBalance = await fetchBalance({
            address: `0x${signer_account.address.replace('0x', '')}`,
            token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace('0x', '')}`,
            chainId: poly_ramm.chainID,
        });

        const withdrawalResult = await multipleLiquidityWithdrawal(
            [LPwmatic_amount_withdraw, LPweth_amount_withdraw, LPusdc_amount_withdraw, LPusdt_amount_withdraw],
            walletClient, pool, false);
        console.log('depositResult', withdrawalResult);

        const newBalance = await fetchBalance({
            address: `0x${signer_account.address.replace('0x', '')}`,
            token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace('0x', '')}`,
            chainId: poly_ramm.chainID,
        });

        console.log('balances', newBalance.value, oldBalance.value);
        expect(newBalance.value).toBeGreaterThan(oldBalance.value);
    });
});
```


## API Reference

# RAMMPool
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

## Methods
- initialize(chain: any, transport?: any): Promise<void>
- initializeWithData(data: poolData): void
- callERC20Token(tokenContractAddress: string, functionName: string, args?: any, params?: any): Promise<any>
- approve(tokenSymbol: string, address: string, amount: BigNumber, gasPrice: any): Promise<any>
- liquidity_deposit(tokenIndex: number, amount: string, gasPrice: any): Promise<any>
- liquidity_withdrawal(tokenOut: number, amount: string, gasPrice: any): Promise<any>
- trade_amount_in(tokenIn: number, tokenOut: number, amountIn: string, minAmount: string, gasPrice: any): Promise<any>
- trade_amount_out(tokenIn: number, tokenOut: number, amountOut: string, maxAmount: string, gasPrice: any): Promise<any>
- getPoolState(): Promise<PoolState>

# Transactions

## Methods
- liquidityDeposit(tokenIn: number, depositAmount: BigNumber, signer: any, pool: RAMMPool, toConvertToWei: boolean, gasPrice: any): Promise<any>
- liquidityWithdrawal(tokenOut: number, amountLPT: BigNumber, pool: RAMMPool, toConvertToWei: boolean, gasPrice: any): Promise<any>
- tradeGivenIn(tokenIn: number, tokenOut: number, tradeAmount: BigNumber, minAmountOut: BigNumber, pool: RAMMPool, doConvertToWei: boolean, gasPrice: any): Promise<any>
- tradeGivenOut(tokenIn: number, tokenOut: number, tradeAmount: BigNumber, maxAmountIn: BigNumber, signer: any, pool: RAMMPool, doConvertToWei: boolean, gasPrice: any): Promise<any>
- multipleLiquidityDeposit(depositAmounts: BigNumber[], signer: any, pool: RAMMPool): Promise<any>
- multipleLiquidityWithdrawal(amountsLPT: BigNumber[], signer: any, pool: RAMMPool, toConvertToWei: boolean): Promise<any>

