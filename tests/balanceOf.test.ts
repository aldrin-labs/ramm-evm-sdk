import {
    RAMMPool,
  } from '../index';
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
  publicClient,
  walletClient,
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

