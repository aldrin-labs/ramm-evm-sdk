import { BigNumber } from 'bignumber.js';
import { RAMMPool } from '../RAMMPool';
import { convertToWei } from '../math/utils';
import { parseGwei } from 'viem';

/**
Performs a simple estimation of an upper bound of the amount of tokenIn needed for a trade considering a price impact of no more than 10%.
This is used to set the amount for the token approval before the trade.
*/
/*
const inGivenOut = function (tokenIn: number, tokenOut: number, amountOut: BigNumber, prices: number[]): BigNumber {
    const amountIn = BigNumber(amountOut).times(1.1 * prices[tokenOut] / prices[tokenIn]);
    return amountIn;
};
*/

/**
 * Performs a liquidity deposit.
 * @param tokenIn The index of the asset will be deposited.
 * @param depositAmount The amount to deposit. It must be given in real token amounts. Then it is converted to wei or the smallest unit of the corresponding token.
 * @param userAddress The address of the user that performs the deposit.
 * @param pool The pool in which to deposit.
 */
const liquidityDeposit = async function(
    tokenIn: number,
    depositAmount: BigNumber,
    signer: any,
    pool: RAMMPool,
    toConvertToWei: boolean = true,
    gasPrice: any = parseGwei('720.42069')
    ) {
    const rammAddress = pool.address;
    const tokenContractsList = pool.tokenContractsList;
    const decimalPlaces = pool.assetsDecimalPlaces[tokenIn];
    let amountIn = depositAmount;
    if (toConvertToWei) amountIn = convertToWei(depositAmount,decimalPlaces);
    
    const tokenContract = tokenContractsList[tokenIn];
    BigNumber.config({ EXPONENTIAL_AT: 36 });
    console.log(tokenContract.address, tokenContract.name)
    const approve_tx = await tokenContract.write.approve([rammAddress, amountIn.toString()],{gasPrice});
    await pool.client.waitForTransactionReceipt({ hash: approve_tx });
    const tx = await pool.liquidity_deposit(tokenIn, amountIn.toString());
    return tx;
};


/**
 * Performs a liquidity withdrawal.
 * @param tokenOut The index of the asset will be withdrawn.
 * @param amountLPT The amount of LP tokens to redeem.
 * @param userAddress The address of the user that performs the withdrawal.
 * @param pool The pool from which to withdraw.
 * @dev The parameter amountLPT must be in real token amounts. Then it is converted to the smallest unit
 * (with respect to the number of decimal places of the token).
 */
const liquidityWithdrawal = async function(
    tokenOut: number,
    amountLPT: BigNumber,
    pool: RAMMPool,
    toConvertToWei: boolean,
    gasPrice: any = parseGwei('720.42069')
    ) {
    const amountLPTconverted = toConvertToWei ? convertToWei(amountLPT, pool.LPTokensDecimalPlaces[tokenOut]) : amountLPT;
    const rammAddress = pool.address;
    BigNumber.config({ EXPONENTIAL_AT: 36 });
    console.log('liquidityWithdrawal approve', pool.assetsAddresses[tokenOut], rammAddress, amountLPTconverted);
    const approve_tx = await pool.approve(pool.assetsAddresses[tokenOut], rammAddress, amountLPTconverted, gasPrice);
    await pool.client.waitForTransactionReceipt({ hash: approve_tx });

    const tx = await pool.liquidity_withdrawal(tokenOut, amountLPTconverted.toString(),{gasPrice});
    return tx;
};

/**
 * Performs a trade given the amount of the token that goes into the pool.
 * @param tokenIn The index of the asset that goes into the pool.
 * @param tokenOut The index of the asset that goes out of the pool.
 * @param tradeAmount The amount of the asset that goes into the pool.
 * @param userAddress The address of the user that performs the trade.
 * @param pool The pool to trade with.
 * @dev The parameters tradeAmount and minAmountOut must be in real token amounts. Then they are converted to wei or the smallest unit.
 * This amounts to 18 decimal places in the case of ETH of MATIC, and the corresponding decimal places if other tokens are considered
 */
const tradeGivenIn = async function(
    tokenIn: number,
    tokenOut: number,
    tradeAmount: BigNumber,
    minAmountOut: BigNumber,
    pool: RAMMPool,
    doConvertToWei: boolean = true,
    gasPrice: any = parseGwei('720.42069')
    ) {
        console.log('pool.assetsDecimalPlaces ', pool.assetsDecimalPlaces, tokenIn);
    console.log('tradeGivenIn', tokenIn, tokenOut, tradeAmount, minAmountOut);
    const decimalPlaces = pool.assetsDecimalPlaces[tokenIn];
    const decimalPlacesOut = pool.assetsDecimalPlaces[tokenOut];
    const amountIn = doConvertToWei ? convertToWei(tradeAmount, decimalPlaces) : tradeAmount;
    console.log('amountIn', amountIn, tradeAmount, decimalPlaces);
    const minAmount = doConvertToWei ? convertToWei(minAmountOut, decimalPlacesOut): minAmountOut;
    const rammAddress = pool.address;
    BigNumber.config({ EXPONENTIAL_AT: 36 });
    console.log('pool.assetsAddresses', pool.assetsAddresses, tokenIn);
    console.log('pool.assetsAddresses[]', pool.assetsAddresses[tokenIn]);
    console.log('tradeGivenIn approve', pool.assetsAddresses[tokenIn], rammAddress, amountIn, amountIn.toString);

    const approve_tx = await pool.approve(pool.assetsAddresses[tokenIn], rammAddress, amountIn, gasPrice);
    await pool.client.waitForTransactionReceipt({ hash: approve_tx });

    const tx = await pool.trade_amount_in(tokenIn, tokenOut, amountIn.toString(), minAmount.toString(), gasPrice);
    return tx;
};

/**
 * Performs a trade given the amount of the token that goes out the pool.
 * @param tokenIn The index of the asset that goes into the pool.
 * @param tokenOut The index of the asset that goes out of the pool.
 * @param tradeAmount The amount of the asset that goes out of the pool.
 * @param userAddress The address of the user that performs the trade.
 * @param pool The pool to trade with.
 * @param prices The prices of the assets of the pool taken from an oracle.
 * @dev The parameters tradeAmount and maxAmountIn must be in real token amounts. Then they are converted to wei or the smallest unit.
 * This amounts to 18 decimal places in the case of ETH of MATIC, and the corresponding decimal places if other tokens are considered
 */
const tradeGivenOut = async function(
    tokenIn: number,
    tokenOut: number,
    tradeAmount: BigNumber,
    maxAmountIn: BigNumber,
    signer: any,
    pool: RAMMPool,
    doConvertToWei: boolean = true,
    gasPrice: any = parseGwei('720.42069')
    ) {
        console.log('tradeGivenOut', tokenIn, tokenOut, tradeAmount, maxAmountIn);
    const decimalPlacesIn = pool.assetsDecimalPlaces[tokenIn];
    const decimalPlacesOut = pool.assetsDecimalPlaces[tokenOut];
    const amountOut = doConvertToWei ? convertToWei(tradeAmount, decimalPlacesOut) : tradeAmount;
    const maxAmount = doConvertToWei ? convertToWei(maxAmountIn, decimalPlacesIn) : maxAmountIn;
    const rammAddress = pool.address;
    BigNumber.config({ EXPONENTIAL_AT: 36 });
    let approve_tx = await pool.approve(pool.assetsAddresses[tokenIn], rammAddress, maxAmount);
    await pool.client.waitForTransactionReceipt({ hash: approve_tx });

    const tx = await pool.trade_amount_out(tokenIn, tokenOut, amountOut.toString(), maxAmount.toString(), gasPrice);
    await pool.client.waitForTransactionReceipt({ hash: tx });

    // Here we set the allowance to 0 again.
    approve_tx = await pool.approve(pool.assetsAddresses[tokenIn], rammAddress, BigNumber(0));
    await pool.client.waitForTransactionReceipt({ hash: approve_tx });

    return tx;
};



/**
 * Performs a liquidity deposit of multiple assets.
 * @param depositAmounts A list with the amounts to deposit. It must be given in real token amounts.
 * Then it is converted to wei or the smallest unit of the corresponding token.
 * @param userAddress The address of the user that performs the deposit.
 * @param pool The pool in which to deposit.
 */
const multipleLiquidityDeposit = async function(
    depositAmounts: BigNumber[],
    signer: any,
    pool: RAMMPool
    ) {
    const rammAddress = pool.address;
    BigNumber.config({ EXPONENTIAL_AT: 36 });
    for (var j = 0; j < pool.n; j++) {
        const amountIn = convertToWei(depositAmounts[j], pool.assetsDecimalPlaces[j]);
        console.log('multipleLiquidityDeposit approve', pool.assetsAddresses[j], rammAddress, amountIn);
        await pool.approve(pool.assetsAddresses[j], rammAddress, amountIn);
        await pool.liquidity_deposit(j, amountIn.toString());
    }
};

/**
 * Performs a liquidity withdrawal of multiple tokens.
 * @param amountsLPT A list with the amounts of LP tokens to redeem.
 * @param userAddress The address of the user that performs the withdrawal.
 * @param pool The pool from which to withdraw.
 * @dev The parameter amountLPT must be in real token amounts. Then it is converted to the smallest unit
 * (with respect to the number of decimal places of the token).
 */
const multipleLiquidityWithdrawal = async function(
    amountsLPT: BigNumber[],
    signer: any,
    pool: RAMMPool,
    toConvertToWei: boolean = true
    ) {
    const rammAddress = pool.address;
    BigNumber.config({ EXPONENTIAL_AT: 36 });
    for (var j = 0; j < pool.n; j++) {
        const amountLPTconverted = toConvertToWei? convertToWei(amountsLPT[j], pool.LPTokensDecimalPlaces[j]) : amountsLPT[j];
        const LPtoken = pool.LPTokensList[j];
        await pool.approve(LPtoken, rammAddress, amountLPTconverted);
        await pool.liquidity_withdrawal(j, amountLPTconverted.toString());
    }
};


export {liquidityDeposit, liquidityWithdrawal, tradeGivenIn, tradeGivenOut, multipleLiquidityDeposit, multipleLiquidityWithdrawal};
