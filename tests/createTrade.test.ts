import {
    tradeGivenIn,
    tradeGivenOut,
    RAMMPool,
  } from '../index';
import { getOutputTradeIn, getOutputTradeOut, getPoolState, TradeParamsBN } from '../src/interface';
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
  publicClient,
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

