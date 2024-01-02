import { BigNumber } from 'bignumber.js';

/**
 * Converts an amount expressed as a decimal number to an integer representing the same amount in the smallest unit of the token involved,
 * using the number of decimal places given.
 */
const convertToWei = function (amount: BigNumber, decimalPlaces: number) {
    const amountBN = BigNumber(amount);
    const amountConverted = amountBN.times(10 ** decimalPlaces).integerValue(BigNumber.ROUND_FLOOR);
    return amountConverted;
};

/**
 * Computes the power of a BigNumber to a number.
 * @param base A BigNumber which is the base of the power. Must belong to the interval [2/3,1.5] for approximation purposes.
 * @param exponent A number which is the exponent of the power.
 * @returns A BigNumber which is the result of base ** exponent.
 */
const powerBN = function (base: BigNumber, exponent: number) {
    const decimalPartOfExponent = exponent - Math.floor(exponent);
    // We use the power series x^a = 1 + a(x-1) + (1/2)a(a-1)(x-1)^2 + ...
    // We use the decimal part of the exponent for greater precision.
    // We will later multiply by the remaining power.
    // In addition, we require that the base belongs to the interval [2/3,1.5]
    // so as to set an upper bound for the number of terms of the power series.
    if (base.isGreaterThan(1.5) || base.times(3).isLessThan(2)) {
        throw new Error('The base must be between 2/3 and 1.5');
    };
    let An = BigNumber(1);
    let Sn = BigNumber(1);
    for ( var j=1 ; j<=30 ; j++ ) {
        An = An.times(decimalPartOfExponent - (j-1)).times(base.minus(1)).dividedBy(j);
        Sn = Sn.plus(An);
    };
    return base.exponentiatedBy(Math.floor(exponent)).times(Sn);
};


export { convertToWei, powerBN };