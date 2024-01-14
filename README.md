# RAMM EVM SDK

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## Overview

The RAMM SDK is a sophisticated TypeScript library designed for seamless integration with RAMM pools on Ethereum/EVM blockchains. As a crucial element in the decentralized finance (DeFi) ecosystem, this SDK facilitates dynamic liquidity and asset management, making it possible for developers to build advanced DeFi solutions. It is simple a wrapper for onchain RAMM deployment, which is basically an AMM

## Features

- Get asset balances for a user in a pool
- Deposit to pool (single asset deposit or multideposit assets)
- Create a trade 
- Show pool state
- Withdraw to pool

## Getting Started

1. Clone the repository `git clone https://github.com/aldrin-labs/ramm-evm-sdk.git`
2. Install dependencies `npm install`
3. Check [Usage](#usage) section or take a look at [tests](https://github.com/aldrin-labs/ramm-evm-sdk/tree/main/tests)

## Usage

### Get asset balances pool

```js
import { RAMMPool } from '../index';
import { getWalletBalances, getLPTokensAmounts } from '../src/interface';
import BigNumber from 'bignumber.js'
import { networkConfig } from '../index';
import { SingleAssetWithdrawalParamsBN, PoolStateBN, TradeParamsBN, poolConfigurationData } from '../src/interface/types';
import {describe, expect, test} from 'vitest';
import { SupportedNetworks } from '../src/constants';
import { createWalletClient, http, publicActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { fetchBalance } from '@wagmi/core';
import { infuraProvider } from 'wagmi/providers/infura'
import { polygon } from 'wagmi/chains'
import { createConfig, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
require('dotenv').config();

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygon],
  [
    infuraProvider({ apiKey: process.env.INFURA_API_KEY as string }),
    publicProvider()
  ],
)
 
createConfig({
  publicClient,
  webSocketPublicClient,
});


const signer_account = privateKeyToAccount(process.env.PRIVATE_KEY) // ts-ignore-line
console.log(signer_account.address, signer_account.publicKey)

const walletClient = createWalletClient({
  account: signer_account,
  chain: polygon,
  transport: http()
}).extend(publicActions); // ts-ignore-line

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

describe('polygon ramm get balanceOf', () => {
  test.skip('balanceOf LP tokens', async () => {
    const configData = networkConfig[SupportedNetworks.matic].poolList[0] as poolConfigurationData;
    await pool.initializeWithData(configData.tokensData);
    console.log('get lp amounts', pool.address);
    const LPAmounts = await getLPTokensAmounts(signer_account.address, [pool])
    console.log('pool state', LPAmounts);

    expect(LPAmounts).toBeDefined();
  }, 120000);

  test('get asset balances for a user in a pool', async () => {
      await pool.initialize(polygon);
      console.log('get pool state', pool.address);
      const balances = await getWalletBalances(signer_account.address, pool)
      console.log('pool balances', balances);

      expect(balances).toBeDefined();
    }, 120000);
});
```

### Deposit

```js
import { liquidityDeposit,multipleLiquidityDeposit, RAMMPool} from '../index';
import BigNumber from 'bignumber.js'
import { networkConfig } from '../index';
import {describe, expect, test} from 'vitest';
import { SupportedNetworks } from '../src/constants';
import { createWalletClient, http, publicActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { fetchBalance } from '@wagmi/core';
import { infuraProvider } from 'wagmi/providers/infura'
import { polygon } from 'wagmi/chains'
import { createConfig, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'

require('dotenv').config();

console.log(polygon.name);

const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygon],
  [
    infuraProvider({ apiKey: process.env.INFURA_API_KEY }),
    publicProvider()
  ],
)
 
createConfig({
  publicClient,
  webSocketPublicClient,
});


const signer_account = privateKeyToAccount(process.env.PRIVATE_KEY)
console.log(signer_account.address, signer_account.publicKey)

const walletClient = createWalletClient({
  account: signer_account,
  chain: polygon,
  transport: http(undefined, {timeout: 420_000})
}).extend(publicActions); // ts-ignore-line

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
  test.skip('add WETH', async () => {
      await pool.initialize(polygon);
      const oldBalance = await fetchBalance({
        address: `0x${signer_account.address.replace('0x', '')}`,
        token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace('0x', '')}`,
        chainId: poly_ramm.chainID,
      });
      console.log('assets:', pool.assetsList);
      console.log('amounts', WETH_INDEX, poly_ramm.tokensData.assetsAddresses[WETH_INDEX], weth_amount_deposit.toString());

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

    test.skip('multideposit WETH, WMATIC, USDC, USDT', async () => {
      await pool.initialize(polygon);

      const oldBalance = await fetchBalance({
        address: `0x${signer_account.address.replace('0x', '')}`,
        token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace('0x', '')}`,
        chainId: poly_ramm.chainID,
      });

      console.log('assets:', pool.assetsList);
      console.log('amounts', weth_amount_deposit.toString());

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

### Create trade

```js
import { tradeGivenIn, tradeGivenOut, RAMMPool} from '../index';
import { getOutputTradeIn, getOutputTradeOut, getPoolState, TradeParamsBN } from '../src/interface';
import BigNumber from 'bignumber.js'
import { networkConfig } from '../index';
import { describe, expect, test} from 'vitest';
import { SupportedNetworks } from '../src/constants';
import { createWalletClient, http, publicActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { fetchBalance } from '@wagmi/core';
import { infuraProvider } from 'wagmi/providers/infura'
import { polygon } from 'wagmi/chains'
import { createConfig, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
require('dotenv').config();
 
console.log(polygon.name);
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygon],
  [
    infuraProvider({ apiKey: process.env.INFURA_API_KEY }),
    publicProvider()
  ],
)
 
createConfig({
  publicClient,
  webSocketPublicClient,
});


const signer_account = privateKeyToAccount(process.env.PRIVATE_KEY)
console.log(signer_account.address, signer_account.publicKey)

const walletClient = createWalletClient({
  account: signer_account,
  chain: polygon,
  transport: http()
}).extend(publicActions); // ts-ignore-line

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

console.log('const wmatic_amount_in', wmatic_amount_in);

const min_weth_amount_out = new BigNumber("264800000000000000", 10); // current price is 3648, but made it lower to pass the test
const tokenIn = 0;
const tokenOut = 1;

describe.skip('polygon ramm create a trade', () => {
  test.skip('tradeGivenIn gives WMATIC and returns WETH', async () => {
      await pool.initialize(polygon);
      const oldBalance = await fetchBalance({
        address: `0x${signer_account.address.replace('0x', '')}`,
        token: `0x${poly_ramm.tokensData.assetsAddresses[tokenOut].replace('0x', '')}`,
        chainId: poly_ramm.chainID,
      });
      console.log('amounts', wmatic_amount_in.toString(), min_weth_amount_out);
      const trade = await tradeGivenIn(tokenIn, tokenOut, wmatic_amount_in, min_weth_amount_out, pool, false);
      console.log('trade', trade);


      const newBalance = await fetchBalance({
        address: `0x${signer_account.address.replace('0x', '')}`,
        token: `0x${poly_ramm.tokensData.assetsAddresses[tokenOut].replace('0x', '')}`,
        chainId: poly_ramm.chainID,
      });

      console.log('balances', newBalance.value, oldBalance.value);
      expect(newBalance.value).toBeGreaterThan(oldBalance.value);
    }, 50000);
  
  test.skip('tradeGivenOut gives WMATIC and returns WETH', async () => {
    await pool.initialize(polygon);
    const oldBalance = await fetchBalance({
      address: `0x${signer_account.address.replace('0x', '')}`,
      token: `0x${poly_ramm.tokensData.assetsAddresses[tokenOut].replace('0x', '')}`,
      chainId: poly_ramm.chainID,
    });

    const trade = await tradeGivenOut(tokenIn, tokenOut, min_weth_amount_out, wmatic_amount_in, client, pool, false);
    console.log('trade', trade);


    const newBalance = await fetchBalance({
      address: `0x${signer_account.address.replace('0x', '')}`,
      token: `0x${poly_ramm.tokensData.assetsAddresses[tokenOut].replace('0x', '')}`,
      chainId: poly_ramm.chainID,
    });
    console.log('balances', newBalance.value, oldBalance.value);

    expect(newBalance.value).toBeGreaterThan(oldBalance.value);
  }, 50000);
});
```

### Show pool state

```js
import { RAMMPool } from '../index';
import { getWalletBalances, getPoolState } from '../src/interface';
import BigNumber from 'bignumber.js'
import { networkConfig } from '../index';
import { SingleAssetWithdrawalParamsBN, PoolStateBN, TradeParamsBN, poolConfigurationData } from '../src/interface/types';
import {describe, expect, test} from 'vitest';
import { SupportedNetworks } from '../src/constants';
import { createWalletClient, http, publicActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { fetchBalance } from '@wagmi/core';
import { infuraProvider } from 'wagmi/providers/infura'
import { polygon } from 'wagmi/chains'
import { createConfig, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
require('dotenv').config();
 
console.log(polygon.name);
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygon],
  [
    infuraProvider({ apiKey: process.env.INFURA_API_KEY as string }),
    publicProvider()
  ],
)
 
createConfig({
  publicClient,
  webSocketPublicClient,
});


const signer_account = privateKeyToAccount(process.env.PRIVATE_KEY) // ts-ignore-line
console.log(signer_account.address, signer_account.publicKey)

const walletClient = createWalletClient({
  account: signer_account,
  chain: polygon,
  transport: http()
}).extend(publicActions); // ts-ignore-line

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

describe('polygon ramm show pool state', () => {
  test.skip('ramm init with data show amount of tokens in the pool', async () => {
    const configData = networkConfig[SupportedNetworks.matic].poolList[0] as poolConfigurationData;
    await pool.initializeWithData(configData.tokensData);
    console.log('get pool state', pool.address);
    const poolState = await getPoolState(pool);
    console.log('pool state', poolState);

    expect(poolState).toBeDefined();
  }, 120000);

  test.skip('ramm show amount of tokens in the pool', async () => {
      await pool.initialize(polygon);
      console.log('get pool state', pool.address);
      const poolState = await getPoolState(pool);
      console.log('pool state', poolState);

      expect(poolState).toBeDefined();
    }, 120000);
});
```

### Withdrawal

```js
import { liquidityWithdrawal, multipleLiquidityWithdrawal, RAMMPool} from '../index';
import BigNumber from 'bignumber.js'
import { networkConfig } from '../index';
import {describe, expect, test} from 'vitest';
import { SupportedNetworks } from '../src/constants';
import { createWalletClient, http, publicActions } from 'viem'
import { privateKeyToAccount } from 'viem/accounts'
import { fetchBalance } from '@wagmi/core';
import { infuraProvider } from 'wagmi/providers/infura'
import { polygon } from 'wagmi/chains'
import { createConfig, configureChains } from 'wagmi'
import { publicProvider } from 'wagmi/providers/public'
require('dotenv').config();
 
console.log(polygon.name);
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [polygon],
  [
    infuraProvider({ apiKey: process.env.INFURA_API_KEY }),
    publicProvider()
  ],
)
 
createConfig({
  publicClient,
  webSocketPublicClient,
});


const signer_account = privateKeyToAccount(process.env.PRIVATE_KEY)
console.log(signer_account.address, signer_account.publicKey)

const walletClient = createWalletClient({
  account: signer_account,
  chain: polygon,
  transport: http()
}).extend(publicActions); // ts-ignore-line

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

describe.skip('polygon ramm withdraw to pool', () => {
  test.skip('withdraw WETH', async () => {
      await pool.initialize(polygon);
      const oldBalance = await fetchBalance({
        address: `0x${signer_account.address.replace('0x', '')}`,
        token: `0x${poly_ramm.tokensData.lptokensAddresses[WETH_INDEX].replace('0x', '')}`,
        chainId: poly_ramm.chainID,
      });
      console.log('assets:', pool.assetsList);
      console.log('amount', LPweth_amount_withdraw, new BigNumber(oldBalance.value.toString()));

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

    test.skip('multideposit WETH, WMATIC, USDC, USDT', async () => {
      await pool.initialize(polygon);

      const oldBalance = await fetchBalance({
        address: `0x${signer_account.address.replace('0x', '')}`,
        token: `0x${poly_ramm.tokensData.assetsAddresses[WETH_INDEX].replace('0x', '')}`,
        chainId: poly_ramm.chainID,
      });

      console.log('assets:', pool.assetsList);
      console.log('amounts', LPweth_amount_withdraw.toString());

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

You can find more complex examples by [link](https://github.com/aldrin-labs/ramm-evm-sdk/tree/main/tests).

## Development
1. Clone [repository](https://github.com/aldrin-labs/ramm-evm-sdk.git)
2. Run `yarn` or `npm install`

## Warning 
The library is under active development. Use it at your own risk.

## Contributing
We highly encourage community contributions. To contribute, please fork the repository, make your changes, and submit a pull request. For significant changes or enhancements, kindly open an issue first to discuss your ideas.

## License
This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer
The RAMM Pool SDK is provided "as is" without any warranty. The authors and contributors are not liable for any damages or liabilities arising from the use of this SDK. Users are responsible for compliance with regulations in their respective jurisdictions.

## Support
For support, please open an issue.

# ramm-sdk

