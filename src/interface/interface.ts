import { trade_i_BN, trade_o_BN, single_asset_withdrawal_BN, get_redeem_amount_BN } from '../math';
import { SingleAssetWithdrawalParamsBN, PoolStateBN, TradeParamsBN, poolConfigurationData } from './types';
import BigNumber from 'bignumber.js';
import { RAMMPool } from '../RAMMPool';
import { networkConfig, SupportedNetworks } from '../constants/networks';


/**
 * Returns a initialized pool from its configuration data and a provider.
 * @param poolConfig Pool's configuration data.
 * @param provider Web3 provider. (might not need it)
 * @returns Initialized pool.
 */
const getPoolFromConfig = function ( poolConfig: poolConfigurationData, publicClient: any, walletClient: any) {
    const pool = new RAMMPool(
        poolConfig.poolAddress,
        poolConfig.chainID,
        poolConfig.poolName,
        poolConfig.numberOfTokens,
        poolConfig.delta,
        poolConfig.baseFee,
        poolConfig.baseLeverage,
        poolConfig.protocolFee,
        publicClient,
        walletClient
    );
    pool.initializeWithData(poolConfig.tokensData);
    return pool;
};

const getPoolsFromNetworkConfig = (publicClient: any, walletClient: any, chainId: any) => {
    const networkConfigData = Object.values(networkConfig);
    return networkConfigData.map(poolItem => {
      return poolItem.poolList.map(poolItem => {
        const poolConfig = poolItem as poolConfigurationData;
        poolConfig.chain = { id: chainId };
        return getPoolFromConfig(poolConfig, publicClient, walletClient);
      });
    }).flat();
  };

/**
 * Initializes all the RAMM pools within a network.
 * @param provider A Web3 provider.
 * @param activeNetwork A supported network.
 * @returns The lists of pools of the activeNetwork, all of them with their respective contracts initialized.
 */
const setContracts = function (publicClient: any, walletClient: any, activeNetwork: SupportedNetworks) {
    const index: number = Object.keys(SupportedNetworks).indexOf(activeNetwork.toString());
    const poolsList = Object.values(networkConfig)[index].poolList as any;
    let initializedPoolsList = [];
    for (let poolConfig of poolsList) {
        const pool = getPoolFromConfig(poolConfig, publicClient, walletClient);
        initializedPoolsList.push(pool);
    }
    return initializedPoolsList;
};



/**
 * Gets the balances of the assets of the active pool and LP tokens of all RAMM pools for the active user.
 */
 const getWalletBalances = async (address: string, pool: RAMMPool) => {
    if (!pool.assetsAddresses || !pool.assetsDecimalPlaces) {
        console.error('Asset addresses or decimal places are undefined');
        return [];
    }
    const balances = await pool.balanceOf(pool.assetsAddresses, address);
    if (!balances) {
        console.error('Balances are undefined');
        return [];
    }
    // Adjust each balance according to its respective decimal places
    const adjustedBalances = (balances as any[]).map((balance: any, index: any) => {
        const tokenDecimalPlaces = pool.assetsDecimalPlaces[index];
        return BigNumber(balance.toString()).div(10 ** tokenDecimalPlaces).toString();
    });

    return adjustedBalances;
};

/**
 * Gets the balances of the LP tokens of all RAMM pools for the active user.
 */
const getLPTokensAmounts = async (address: string, poolsList: RAMMPool[]) => {
    let balancesLPT: any[] = [];
    for ( let pool of poolsList ) {
        const balancesLPTpool = (await pool.balanceOf(pool.LPTokenAddresses, address)) as any[];
        balancesLPT.push(...balancesLPTpool);
        pool.LPTokensDecimalPlaces.forEach((decimals, i) => {balancesLPT[i] = BigNumber(balancesLPT[i].toString()).div(10**decimals).toString()})
    };
    return balancesLPT;
};

const getPoolState = async function (pool: RAMMPool) {
    return pool.getPoolState()
};

 /**
 * For a trade given in, returns the computed amount of tokenOut, the swap fee, the protocol fee and the price impact.
 */
 const getOutputTradeIn = function (
    tradeParams: TradeParamsBN,
    poolState: PoolStateBN,
    pool: RAMMPool
    ) {
    const tradeOut = trade_i_BN(tradeParams.indexTokenIn, tradeParams.indexTokenOut, tradeParams.amount, poolState.balances, poolState.LPTokensIssued, poolState.prices, pool);
    let tradeOutStr = {
        amount: tradeOut.amount.toString(),
        swapFee: tradeOut.swapFee.toString(),
        protocolFee: tradeOut.protocolFee.toString(),
        priceImpact: (tradeOut.priceImpact*100).toString(),
        execute: tradeOut.execute,
        message: tradeOut.message
    };
    if ( tradeOutStr.execute == false ) {
        tradeOutStr.amount = 'Trade not allowed.';
        tradeOutStr.swapFee = '0';
        tradeOutStr.priceImpact = '0';
    };
    return tradeOutStr;
};

/**
 * For a trade given out, returns the computed amount of tokenIn, the swap fee, the protocol fee and the price impact.
 */
const getOutputTradeOut = function (
    tradeParams: TradeParamsBN,
    poolState: PoolStateBN,
    pool: RAMMPool
    ) {
    const tradeOut = trade_o_BN(tradeParams.indexTokenIn, tradeParams.indexTokenOut, tradeParams.amount, poolState.balances, poolState.LPTokensIssued, poolState.prices, pool);
    let tradeOutStr = {
        amount: tradeOut.amount.toString(),
        swapFee: tradeOut.swapFee.toString(),
        protocolFee: tradeOut.protocolFee.toString(),
        priceImpact: (tradeOut.priceImpact*100).toString(),
        execute: tradeOut.execute,
        message: tradeOut.message
    };
    if ( tradeOut.execute == false ) {
        tradeOutStr.amount = 'Trade not allowed.';
        tradeOutStr.swapFee = '0';
        tradeOutStr.priceImpact = '0';
    };
    return tradeOutStr;
};

const getSingleAssetWithdrawalOutput = function (
    withdrawalInput: SingleAssetWithdrawalParamsBN,
    poolState: PoolStateBN,
    pool: RAMMPool
    ) {
    return single_asset_withdrawal_BN(withdrawalInput.tokenIndex, withdrawalInput.amountLPT, poolState.balances, poolState.LPTokensIssued, poolState.prices, pool);
};

const getRedeemAmount = function (lpt: BigNumber, poolState: PoolStateBN) {
    return get_redeem_amount_BN(lpt, poolState.balances, poolState.LPTokensIssued, poolState.prices);
};


export { getPoolsFromNetworkConfig, setContracts, getPoolFromConfig, getLPTokensAmounts, getWalletBalances, getPoolState, getOutputTradeIn, getOutputTradeOut, getSingleAssetWithdrawalOutput, getRedeemAmount };
