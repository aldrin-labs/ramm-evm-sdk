import {
    RAMMPool,
  } from '../index';
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

