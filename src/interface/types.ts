import BigNumber from 'bignumber.js'

interface SingleAssetWithdrawalParams {
    tokenIndex: number,
    amountLPT: number
};

interface SingleAssetWithdrawalParamsBN {
    tokenIndex: number,
    amountLPT: BigNumber
};

interface PoolStateBN {
    balances: BigNumber[],
    LPTokensIssued: BigNumber[],
    prices: number[]
};

interface TradeParamsBN {
    indexTokenIn: number,
    indexTokenOut: number,
    amount: BigNumber,
};

interface poolData {
    assetsAddresses: string[],
    lptokensAddresses: string[],
    priceFeedsAddresses: string[],
    assetsDecimalPlaces: number[],
    lptokensDecimalPlaces: number[],
    priceFeedsDecimalPlaces: number[],
    assetsSymbols: string[],
    lptokensSymbols: string[],
};

interface poolConfigurationData {
    poolAddress: string,
    chainID: number,
    poolName: string,
    numberOfTokens: number,
    delta: number,
    baseFee: number,
    baseLeverage: number,
    protocolFee: number,
    tokensData: poolData,
    chain: any,
};

interface transactionLog {
    address: string,
    blockHash: string,
    blockNumber: Number,
    data: string,
    logIndex: Number,
    topics: string[],
    transactionHash: string,
    transactionIndex: Number,
};

export type { SingleAssetWithdrawalParams, SingleAssetWithdrawalParamsBN, PoolStateBN, TradeParamsBN, poolData, poolConfigurationData, transactionLog }
