export enum SupportedNetworks {
    maticMumbai,
    matic,
    bscTestnet,
    bsc,
    arbitrum
}

export const networkConfig = {
    [SupportedNetworks.matic]: {
        name: 'Polygon Mainnet',
        networkLogo: 'https://s2.coinmarketcap.com/static/img/coins/64x64/3890.png',
        poolList: [
            {
                poolAddress: '0x9362781aa8199ffb1770ee7b2814218977574f63',
                chainID: 137,
                poolName: 'RAMM Pool - Polygon Mainnet',
                numberOfTokens: 4,
                delta: 0.25,
                baseFee: 0.001,
                baseLeverage: 100,
                protocolFee: 0.5,
                tokensData: {
                    assetsAddresses: [
                        '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
                        '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619',
                        '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
                        '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
                    ],
                    lptokensAddresses: [
                        '0xb6A341dd05fACFFdbb5823d8e13Df95C64355E66',
                        '0xb99Fc04fd206F877cEcEbe7250F2a4Fce2e85143',
                        '0x61A844ed08568F643637A4098E3e8Ef942db2334',
                        '0x9F6fD51BEa7d8e4169F9c1806F4bCE7b0a6159ec'],
                    priceFeedsAddresses: [
                        '0xAB594600376Ec9fD91F8e885dADF0CE036862dE0',
                        '0xf9680d99d6c9589e2a93a78a04a279e509205945',
                        '0xfe4a8cc5b5b2366c1b58bea3858e81843581b2f7',
                        '0x0A6513e40db6EB1b165753AD52E80663aeA50545'],
                    assetsDecimalPlaces: [18, 18, 6, 6],
                    lptokensDecimalPlaces: [18, 18, 18, 18],
                    priceFeedsDecimalPlaces: [8, 8, 8, 8],
                    assetsSymbols: ['WMATIC', 'WETH', 'USDC', 'USDT'],
                    lptokensSymbols: ['LPWMATIC', 'LPWETH', 'LPUSDC', 'LPUSDT'],
                },
            },
        ],
    }
};
