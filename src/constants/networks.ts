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
                poolAddress: '0xf803Fd20248d64add5F3616e7e97BA9d326cc1C8',
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
                        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
                        '0xc2132D05D31c914a87C6611C10748AEb04B58e8F'
                    ],
                    lptokensAddresses: [
                        '0x4BDAcc1eA436750124cb3AB25B0B0A5Eb8C34345',
                        '0x19b22BA8E814011a11183c478FFbc44D8ef73dFa',
                        '0x507cACA66198CBac8b93678375C319995518c156',
                        '0x3F350599da639232Ce21E4AA74f43D6d146813D9'],
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
    },
};
