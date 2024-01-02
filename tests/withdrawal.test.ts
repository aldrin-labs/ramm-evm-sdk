import {
    liquidityWithdrawal,
    multipleLiquidityWithdrawal,
    RAMMPool,
  } from '../index';
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

