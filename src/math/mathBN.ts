import { RAMMPool } from '../RAMMPool'
import BigNumber from 'bignumber.js'
import { powerBN } from './utils'

const tradeOutputBN = function (
    amount: BigNumber,
    swapFee: BigNumber,
    protocolFee: BigNumber,
    priceImpact: number,
    execute: boolean,
    message: string
) {
    return { amount: amount, swapFee: swapFee, protocolFee: protocolFee, priceImpact: priceImpact, execute: execute, message: message };
};

/**
 * Generates a list of zeroes of the given length.
 * @param N The length of the list.
 */
const listOfZeroesBN = function (N: number) {
    const arr: BigNumber[] = new Array(N).fill(BigNumber(0));
    return arr;
};

/**
 * Computes the price impact given the parameters of a trade.
 */
const computePriceImpactBN = function (amountIn: BigNumber, amountOut: BigNumber, price_i: number, price_o: number) {
    if (price_i == 0 || price_o == 0 || amountOut.isEqualTo(BigNumber(0))) {
        // The price impact can not be computed in this case.
        // We return 0 to avoid errors. This can be changed later to throw an Error or to another behaviour.
        return 0;
    }
    const effectivePrice = amountIn.div(amountOut); // price paid for each unit of tokenOut
    const marketPrice = price_o / price_i; // market price of token_o in terms of token_i
    const priceImpact = effectivePrice.minus(marketPrice).div(marketPrice).toNumber();
    return priceImpact;
};

/**
Returns a list with the weights of the tokens with respect to the given prices.
*/
const weightsBN = function (balances: BigNumber[], prices: number[]) {
    const N: number = balances.length;
    let B: BigNumber = BigNumber(0);
    let W: number[] = [];
    for (var j = 0; j < N; j++) {
        B = B.plus(balances[j].times(prices[j]));
    }
    for (var j = 0; j < N; j++) {
        W.push(balances[j].times(prices[j]).div(B).toNumber());
    }
    return W;
};

/**
Returns a list with the values of the parameters B and L.
Recall that B is the pools' TVL and L is a similar computation
done with the LP tokens issued instead of the pool balances.
*/
const compute_B_and_L_BN = function (
    balances: BigNumber[],
    lp_tokens_issued: BigNumber[],
    prices: number[]
    ) {
        let B: BigNumber = BigNumber(0);
        let L: BigNumber = BigNumber(0);
        const N: number = balances.length;
        for (var j = 0; j < N; j++) {
            B = B.plus(balances[j].times(prices[j]));
            L = L.plus(lp_tokens_issued[j].times(prices[j]));
        }
    return [B,L];
};

/**
 * Computes the imbalance ratios of the tokens. Returns a list.
 */
const imbalance_ratios_BN = function (
    balances: BigNumber[],
    lp_tokens_issued: BigNumber[],
    prices: number[]
    ) {
        const N: number = balances.length;
        let Imb: number[] = [];
        let BL = compute_B_and_L_BN(balances, lp_tokens_issued, prices);
        let B: BigNumber = BL[0];
        let L: BigNumber = BL[1];
        for (var j = 0; j < N; j++) {
            if (!lp_tokens_issued[j].isEqualTo(BigNumber(0))) {
                const Imb_j= L.times(balances[j]).div(B.times(lp_tokens_issued[j]));
                Imb.push(Imb_j.toNumber());
            } else {
                Imb.push(0);
            }
        }
        return Imb;
};

/**
 * Checks if the imbalance ratios of the tokens involved in a trade still belong to the corresponding range
 * after the trade (or if they are closer to the range than before the trade).
 */
const check_imbalance_ratios_BN = function (
    balances: BigNumber[],
    lp_tokens_issued: BigNumber[],
    prices: number[],
    i: number,
    o: number,
    ai: BigNumber,
    ao: BigNumber,
    pr_fee: BigNumber,
    pool: RAMMPool
    ) {
        let balances_before: BigNumber[] = balances.map((x) => x);
        let balances_after: BigNumber[] = balances.map((x) => x);
        balances_after[i] = balances[i].plus(ai).minus(pr_fee);
        balances_after[o] = balances[o].minus(ao);
        const imb_ratios_before_trade: number[] = imbalance_ratios_BN(balances_before, lp_tokens_issued, prices);
        const imb_ratios_after_trade: number[] = imbalance_ratios_BN(balances_after, lp_tokens_issued, prices);

        const condition1: boolean = (
            imb_ratios_after_trade[o] < 1 - pool.delta
            && imb_ratios_after_trade[o] < imb_ratios_before_trade[o]
            )
        const condition2: boolean = (
            1 + pool.delta < imb_ratios_after_trade[i]
            && imb_ratios_before_trade[i] < imb_ratios_after_trade[i]
            )

        if ( condition1 || condition2 ) {
            return false;
        }
        return true;
};

/**
 * Returns a message according to the trade being executed or not, following the imbalance ratios check
 */
const check_imbalance_ratios_message = function (execute: boolean) {
    if (execute == true) {
        return "Trade executed."
    } else {
        return "The trade was not executed because of pool imbalance."
    };
};

/**
Returns the scaled base fee and leverage parameter for a trade where token i goes into the pool and
token o goes out of the pool.
*/
const scaled_fee_and_leverage_BN = function(
    balances: BigNumber[],
    lp_tokens_issued: BigNumber[],
    prices: number[],
    i: number,
    o: number,
    pool: RAMMPool
    ) {
        const imbalance: number[] = imbalance_ratios_BN(balances, lp_tokens_issued, prices);
        const adjust_i: number = imbalance[i] ** 3;
        const adjust_o: number = imbalance[o] ** 3;
        const scaled_base_fee: number = adjust_i * pool.baseFee / adjust_o;
        const scaled_leverage: number = adjust_o * pool.baseLeverage / adjust_i;
        return [scaled_base_fee,scaled_leverage];
};

/**
Computes the parameters of a trade where an amount ai of token i goes into the pool
and token o goes out of the pool. Returns the amount ao of token o that goes
out of the pool, the base fee that is charged and a boolean that indicates if the trade has to be executed or not.
*/
const trade_i_BN = function(
    i: number,
    o: number,
    ai: BigNumber,
    balances: BigNumber[],
    lp_tokens_issued: BigNumber[],
    prices: number[],
    pool: RAMMPool
    ) {
    // Preliminary checks
    if (lp_tokens_issued[i].isEqualTo(BigNumber(0))) {
        const msg = 'The trade is not allowed because there are no LP tokens of the in-token type in circulation.';
        const output = tradeOutputBN(BigNumber(0), BigNumber(0), BigNumber(0), 0, false, msg);
        return output;
    };
    if (balances[o].isEqualTo(BigNumber(0))) {
        const msg = 'The trade is not possible because there is currently no out-token left in the pool.';
        const output = tradeOutputBN(BigNumber(0), BigNumber(0), BigNumber(0), 0, false, msg);
        return output;
    };
    // First we compute the weights.
    const W: number[] = weightsBN(balances, prices);
    // We divide into different cases.
    if (balances[i].isEqualTo(BigNumber(0))) {
        const ao = ai.times(( 1 - pool.baseFee ) * prices[i] / prices[o]);
        const pr_fee: BigNumber = ai.times(pool.protocolFee * pool.baseFee);
        const execute: boolean = check_imbalance_ratios_BN(balances, lp_tokens_issued, prices, i, o, ai, ao, pr_fee, pool);
        const priceImp = computePriceImpactBN(ai, ao, prices[i], prices[o]);
        const msg = check_imbalance_ratios_message(execute);
        const output = tradeOutputBN(ao, ai.times(pool.baseFee), pr_fee, priceImp, execute, msg);
        return output;
    };
    if (lp_tokens_issued[o].isEqualTo(BigNumber(0)) && !(balances[i].isEqualTo(BigNumber(0)))) { // Self.balances[i]!=0 is not needed here, but added anyway just in case
        const leverage: number = pool.baseLeverage;
        const trading_fee: number = pool.baseFee;
        const bi: BigNumber = balances[i].times(leverage);
        const wi: number = W[i];
        const bo: BigNumber = balances[o].times(leverage);
        const wo: number = W[o];
        let ao = BigNumber(0);
        try {
            ao = bo.times(BigNumber(1).minus(powerBN(bi.dividedBy(bi.plus(ai.times(1-trading_fee))),wi/wo)));
        } catch (error) {
            const msg = 'Math error.';
            const output = tradeOutputBN(BigNumber(0), BigNumber(0), BigNumber(0), 0, false, msg);
            return output;
        }
        const pr_fee: BigNumber = ai.times(pool.protocolFee * trading_fee);
        const execute: boolean = check_imbalance_ratios_BN(balances, lp_tokens_issued, prices, i, o, ai, ao, pr_fee, pool);
        const priceImp = computePriceImpactBN(ai, ao, prices[i], prices[o]);
        const msg = check_imbalance_ratios_message(execute);
        const output = tradeOutputBN(ao, ai.times(trading_fee), pr_fee, priceImp, execute, msg);
        return output;
    }
    if (!(lp_tokens_issued[o].isEqualTo(BigNumber(0))) && !(balances[i].isEqualTo(BigNumber(0)))) { // Self.balances[i]!=0 is not needed here, but added anyway just in case
        // We check imbalance ratio of token o.
        const imb_ratios_initial_o: number = imbalance_ratios_BN(balances, lp_tokens_issued, prices)[o];
        if (imb_ratios_initial_o < 1 - pool.delta) {
            // In this case the trade is not performed because the imbalance ratio of token o is too low.
            const msg = 'The trade will not be executed because the imbalance ratio of the out-token is too low.';
            const output = tradeOutputBN(BigNumber(0), BigNumber(0), BigNumber(0), 0, false, msg);
            return output;
        }
        // Now we update the fee and the leverage parameter.
        const FL = scaled_fee_and_leverage_BN(balances, lp_tokens_issued, prices, i, o, pool);
        const trading_fee: number = FL[0];
        const leverage: number = FL[1];
        // Now we compute the amounts of the trade.
        const bi: BigNumber = balances[i].times(leverage);
        const wi: number = W[i];
        const bo: BigNumber = balances[o].times(leverage);
        const wo: number = W[o];
        let ao = BigNumber(0);
        try {
            ao = bo.times(BigNumber(1).minus(powerBN(bi.dividedBy(bi.plus(ai.times(1-trading_fee))), wi/wo)));
        } catch (error) {
            const msg = 'Math error.';
            const output = tradeOutputBN(BigNumber(0), BigNumber(0), BigNumber(0), 0, false, msg);
            return output;
        }
        const pr_fee: BigNumber = ai.times(pool.protocolFee * trading_fee);
        // Now we check if there is enough balance of token o.
        if (ao.isGreaterThan(balances[o]) || (ao.isEqualTo(balances[o]) && !(lp_tokens_issued[o].isEqualTo(BigNumber(0))))) {
            // In this case the trade is not executed because there is not enough balance of token o.
            const msg = 'The trade will not be executed because there is not enough balance of the out-token.';
            const output = tradeOutputBN(BigNumber(0), BigNumber(0), BigNumber(0), 0, false, msg);
            return output;
        }
        const execute: boolean = check_imbalance_ratios_BN(balances, lp_tokens_issued, prices, i, o, ai, ao, pr_fee, pool);
        const priceImp = computePriceImpactBN(ai, ao, prices[i], prices[o]);
        const msg = check_imbalance_ratios_message(execute);
        const output = tradeOutputBN(ao, ai.times(trading_fee), pr_fee, priceImp, execute, msg);
        return output;
    }
    const output = tradeOutputBN(BigNumber(0), BigNumber(0), BigNumber(0), 0, false, 'Trade not executed.');
    return output;
};

/**
Computes the parameters of a trade where an amount ao of token o goes out of the pool
and token i goes into the pool. Returns the amount ai of token i that goes
into the pool, the base fee that is charged, and a boolean that indicates if the trade has to be executed or not.
*/
const trade_o_BN = function(
    i: number,
    o: number,
    ao: BigNumber,
    balances: BigNumber[],
    lp_tokens_issued: BigNumber[],
    prices: number[],
    pool: RAMMPool
    ) {

    // Preliminary checks
    if (lp_tokens_issued[i].isEqualTo(BigNumber(0))) {
        const msg = 'The trade is not allowed because there are no LP tokens of the in-token type in circulation.';
        const output = tradeOutputBN(BigNumber(0), BigNumber(0), BigNumber(0), 0, false, msg);
        return output;
    }
    if (balances[o].isLessThanOrEqualTo(ao)) {
        const msg = 'The trade is not allowed because there is not enough balance of the out-token.';
        const output = tradeOutputBN(BigNumber(0), BigNumber(0), BigNumber(0), 0, false, msg);
        return output;
    }
    // First we compute the weights.
    const W: number[] = weightsBN(balances, prices);
    // Now we divide into different cases.
    if (balances[i].isEqualTo(BigNumber(0))) {
        const ai: BigNumber = ao.times(prices[o] / (prices[i] * (1 - pool.baseFee)));
        const pr_fee: BigNumber = ai.times(pool.protocolFee * pool.baseFee);
        const execute: boolean = check_imbalance_ratios_BN(balances, lp_tokens_issued, prices, i, o, ai, ao, pr_fee, pool);
        const priceImp = computePriceImpactBN(ai, ao, prices[i], prices[o]);
        const msg = check_imbalance_ratios_message(execute);
        const output = tradeOutputBN(ai, ai.times(pool.baseFee), pr_fee, priceImp, execute, msg);
        return output;
    }
    if (lp_tokens_issued[o].isEqualTo(BigNumber(0)) && !(balances[i].isEqualTo(BigNumber(0)))) { // Self.balances[i]!=0 is not needed here, but added anyway just in case
        const leverage: number = pool.baseLeverage;
        const bi: BigNumber = balances[i].times(leverage);
        const wi: number = W[i];
        const bo: BigNumber = balances[o].times(leverage);
        const wo: number = W[o];
        let ai = BigNumber(0);
        try {
            ai = bi.times(powerBN( bo.dividedBy(bo.minus(ao)), wo/wi ).minus(1)).dividedBy(1 - pool.baseFee);
        } catch (error) {
            const msg = 'Math error.';
            const output = tradeOutputBN(BigNumber(0), BigNumber(0), BigNumber(0), 0, false, msg);
            return output;
        }
        const pr_fee: BigNumber = ai.times(pool.protocolFee * pool.baseFee);
        const execute: boolean = check_imbalance_ratios_BN(balances, lp_tokens_issued, prices, i, o, ai, ao, pr_fee, pool);
        const priceImp = computePriceImpactBN(ai, ao, prices[i], prices[o]);
        const msg = check_imbalance_ratios_message(execute);
        const output = tradeOutputBN(ai, ai.times(pool.baseFee), pr_fee, priceImp, execute, msg);
        return output;
    }

    if (!lp_tokens_issued[o].isEqualTo(BigNumber(0)) && !balances[i].isEqualTo(BigNumber(0))){ // Self.balances[i]!=0 is not needed here, but added anyway just in case
        // We check the imbalance ratio of token o.
        const imb_ratios_initial: number[] = imbalance_ratios_BN(balances, lp_tokens_issued, prices);
        if (imb_ratios_initial[o] < 1 - pool.delta) {
            // In this case we do not execute the trade because the imbalance ratio of token o is too low.')
            const msg = 'The trade will not be executed because the imbalance ratio of the out-token is too low.';
            const output = tradeOutputBN(BigNumber(0), BigNumber(0), BigNumber(0), 0, false, msg);
            return output;
        }

        // Now we update the fee and the leverage parameter.
        const FL = scaled_fee_and_leverage_BN(balances, lp_tokens_issued, prices, i, o, pool);
        const trading_fee: number = FL[0];
        const leverage: number = FL[1];
        // Now we perform the trade
        const bi: BigNumber = balances[i].times(leverage);
        const wi: number = W[i];
        const bo: BigNumber = balances[o].times(leverage);
        const wo: number = W[o];
        let ai = BigNumber(0);
        try {
            ai = bi.times( powerBN( bo.dividedBy(bo.minus(ao)), wo/wi ).minus(1)).dividedBy(1 - trading_fee);
        } catch (error) {
            const msg = 'Math error.';
            const output = tradeOutputBN(BigNumber(0), BigNumber(0), BigNumber(0), 0, false, msg);
            return output;
        }
        const pr_fee: BigNumber = ai.times(pool.protocolFee * trading_fee);
        // We check the imbalance ratios
        const execute: boolean = check_imbalance_ratios_BN(balances, lp_tokens_issued, prices, i, o, ai, ao, pr_fee, pool);
        const priceImp = computePriceImpactBN(ai, ao, prices[i], prices[o]);
        const msg = check_imbalance_ratios_message(execute);
        const output = tradeOutputBN(ai, ai.times(trading_fee), pr_fee, priceImp, execute, msg);
        return output;
    }
    const output = tradeOutputBN(BigNumber(0), BigNumber(0), BigNumber(0), 0, false, 'Trade not executed.');
    return output;
};

/**
Computes the parameters of a single asset deposit of amount i of token i.
Returns the amount of LP tokens that must be given to the liquidity provider.
*/
const single_asset_deposit_BN = function(
    i: number,
    ai: BigNumber,
    balances: BigNumber[],
    lp_tokens_issued: BigNumber[],
    prices: number[]
    ){
    // we divide into cases
    if (lp_tokens_issued[i].isEqualTo(BigNumber(0)) || (!lp_tokens_issued[i].isEqualTo(BigNumber(0)) && balances[i].isEqualTo(BigNumber(0)))) {
        const BL = compute_B_and_L_BN(balances, lp_tokens_issued, prices);
        const B: BigNumber = BL[0];
        const L: BigNumber = BL[1];

        if ( B.isEqualTo(BigNumber(0)) ) {
            const lpt: BigNumber = ai;
            return lpt;
        }
        if ( !(B.isEqualTo(BigNumber(0))) ) {
            const lpt: BigNumber = ai.times(L.dividedBy(B));
            return lpt;
        }
    }

    if (!lp_tokens_issued[i].isEqualTo(BigNumber(0)) && !balances[i].isEqualTo(BigNumber(0))) {
        const imb_ratios: number[] = imbalance_ratios_BN(balances, lp_tokens_issued, prices);
        const bi: BigNumber = balances[i];
        const ri: number = imb_ratios[i];
        const lpt: BigNumber = ai.dividedBy(bi).times(ri).times(lp_tokens_issued[i]);
        return lpt;
    }
    return 0;
};

const formatWithdrawalOutputBN = function (amounts_out: BigNumber[], ao: BigNumber, a_remaining: BigNumber, pool: RAMMPool) {
    let amountsOutFormatted = [];
    for (var j = 0 ; j < pool.n ; j++ ) {
        amountsOutFormatted.push({ amount: amounts_out[j], tokenIndex: j, tokenAddress: pool.assetsAddresses[j] })
    }
    return {amountsTokens: amountsOutFormatted, totalAmount: ao, remainingAmount: a_remaining};
}

/**
    Given an amount of LP tokens and its type o,
    returns the amounts of each token to be given to the LP,
    the value given to the LP in terms of token o, and the remaining
    amount of token o to be given to the LP (if any) in case the
    process could not be completed.
**/
const single_asset_withdrawal_BN = function(
    o: number,
    lpt: BigNumber,
    balances: BigNumber[],
    lp_tokens_issued: BigNumber[],
    prices: number[],
    pool: RAMMPool
    ) {

    let amounts_out: BigNumber[] = listOfZeroesBN(pool.n);
    let a_remaining: BigNumber = BigNumber(0);
    const bo: BigNumber = balances[o];
    let imb_ratios: number[] = imbalance_ratios_BN(balances, lp_tokens_issued, prices);
    let ao: BigNumber = BigNumber(0);

    if (balances[o].isEqualTo(BigNumber(0))) {
        const BL = compute_B_and_L_BN(balances, lp_tokens_issued, prices);
        const B: BigNumber = BL[0];
        const L: BigNumber = BL[1];
        ao = lpt.times(B.dividedBy(L));
        a_remaining = ao;
        // The liquidity provider receives 0 token o.
        // We continue the withdrawal with another token.
    }

    if (!(balances[o].isEqualTo(BigNumber(0)))) {
        const ro: number = imb_ratios[o];
        const Lo: BigNumber = lp_tokens_issued[o];
        // ao = lpt*bo/(Lo*ro)
        if (lpt.isLessThan(lp_tokens_issued[o])) {
            ao = lpt.multipliedBy(bo.dividedBy(Lo.times(ro)));
            let max_token_o: BigNumber = BigNumber(0);

            if (1 - pool.delta < ro) {
                const BL = compute_B_and_L_BN(balances, lp_tokens_issued, prices);
                const B: BigNumber = BL[0];
                const L: BigNumber = BL[1];
                // M1=bo-(1.0-DELTA)*(Lo-lpt)*B/L
                const min_token_o: BigNumber =  B.times(Lo.minus(lpt)).dividedBy(L).times(1 - pool.delta);
                max_token_o = balances[o].minus(min_token_o);
            } else {
                // M1 = lpt*bo/Lo
                max_token_o = lpt.times(bo.dividedBy(Lo));
            }

            if (ao.isLessThanOrEqualTo(max_token_o)) {
                amounts_out[o] = amounts_out[o].plus(ao);
                // The liquidity provider receives ao token o.
                return formatWithdrawalOutputBN(amounts_out, ao, BigNumber(0), pool);
            }

            if (ao.isGreaterThan(max_token_o)) {
                amounts_out[o] = amounts_out[o].plus(max_token_o);
                // The liquidity provider receives max_token_o token o
                a_remaining = ao.minus(max_token_o);
                imb_ratios[o] = 0; // to avoid choosing token o again in the next steps
                // We continue the withdrawal with another token.
            }
        } else {
            ao = bo.dividedBy(ro);
            if (ao.isLessThanOrEqualTo(balances[o])) {
                amounts_out[o] = amounts_out[o].plus(ao);
                // The liquidity provider receives ao token o.
                return formatWithdrawalOutputBN(amounts_out, ao, BigNumber(0), pool);
            }
            if (ao.isGreaterThan(balances[o])) {
                amounts_out[o] = amounts_out[o].plus(balances[o]);
                // The liquidity provider receives balances[o] token o
                a_remaining = ao.minus(balances[o]);
                imb_ratios[o] = 0; // to avoid choosing token o again in the next steps
                // We continue the withdrawal with another token
            }
        }
    }
    // Now the withdrawal continues with another token
    // and employs the remaining amount.
    imb_ratios[o]=0;
    const N: number = balances.length;
    for (var j = 0; j < N; j++) {
        // We compute the maximum among the remaining imbalance ratios.
        const max_imb_ratio = Math.max(...imb_ratios);
        if (!a_remaining.isEqualTo(BigNumber(0)) && max_imb_ratio > 0) {
            let k = imb_ratios.indexOf(max_imb_ratio);
            // We set imb_ratios[k]=0 to avoid choosing index k again.
            imb_ratios[k]=0;
            const ak: BigNumber = a_remaining.times(prices[o] / prices[k]);
                // const bk: BigNumber = balances[k];
                const Lk: BigNumber = lp_tokens_issued[k];
                const BL = compute_B_and_L_BN(balances, lp_tokens_issued, prices);
                const B: BigNumber = BL[0];
                const L: BigNumber = BL[1];
                // Mk = bk-(1.0-DELTA)*Lk*B/L
                const min_token_k: BigNumber = B.times(Lk).dividedBy(L).times(1 - pool.delta);
                const max_token_k: BigNumber = balances[k].minus(min_token_k);
                if (ak.isLessThanOrEqualTo(max_token_k)) {
                    amounts_out[k] = amounts_out[k].plus(ak);
                    // The liquidity provider receives ak token k.
                    a_remaining = BigNumber(0);
                }
                if (ak.isGreaterThan(max_token_k)) {
                    amounts_out[k] = amounts_out[k].plus(max_token_k);
                    // The liquidity provider receives max_token_k token k.
                    // The value of max_token_k in terms of token o is max_token_k*prices[k]/prices[o]
                    const value_max_token_k: BigNumber = max_token_k.times(prices[k]/prices[o]);
                    a_remaining = a_remaining.minus(value_max_token_k);
                }
        }
    }
    return formatWithdrawalOutputBN(amounts_out, ao, a_remaining, pool);
};

/**
 * Computes the amount that a liquidity provider receives when redeeming an amount lpt of LP tokens.
 */
const get_redeem_amount_BN = function (
    lpt: BigNumber,
    balances: BigNumber[],
    lp_tokens_issued: BigNumber[],
    prices: number[]
    ) {
    const BL = compute_B_and_L_BN(balances, lp_tokens_issued, prices);
    const B: BigNumber = BL[0];
    const L: BigNumber = BL[1];
    const ao: BigNumber = lpt.times(B.dividedBy(L));
    return ao;
};

export {
    weightsBN,
    compute_B_and_L_BN,
    imbalance_ratios_BN,
    check_imbalance_ratios_BN,
    scaled_fee_and_leverage_BN,
    trade_i_BN,
    trade_o_BN,
    single_asset_deposit_BN,
    single_asset_withdrawal_BN,
    get_redeem_amount_BN,
};
