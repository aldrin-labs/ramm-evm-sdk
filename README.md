# RAMM EVM SDK

A TypeScript SDK for interacting with RAMM (Risk-Adjusted Market Making) pools on EVM-compatible blockchains.

## Installation

```bash
# Using yarn
yarn add @ramm/ramm-evm-sdk

# Using npm
npm install @ramm/ramm-evm-sdk
```

## Getting Started

### Initializing the SDK

First, import the `RAMMPool` class from the SDK:

```typescript
import { RAMMPool } from '@ramm/ramm-evm-sdk';
import { createPublicClient, http } from 'viem';
import { mainnet } from 'viem/chains';
import { BigNumber } from 'bignumber.js';
```

### Connecting to a Pool

There are two ways to initialize a RAMM pool:

#### Method 1: Using `initialize`

```typescript
// Create a viem public client
const client = createPublicClient({
  chain: mainnet,
  transport: http('https://eth-mainnet.g.alchemy.com/v2/YOUR_API_KEY')
});

// Initialize the pool
const pool = new RAMMPool();
await pool.initialize({
  poolAddress: '0xYourPoolAddress',
  chainID: 1, // Ethereum Mainnet
  client: client,
  walletClient: yourWalletClient // Optional, required for transactions
});
```

#### Method 2: Using `initializeWithData`

```typescript
// If you already have the pool configuration data
const poolConfigData = {
  poolAddress: '0xYourPoolAddress',
  chainID: 1,
  poolName: 'My RAMM Pool',
  numberOfTokens: 3,
  delta: 0.5,
  baseFee: 0.003,
  baseLeverage: 5,
  protocolFee: 0.1,
  tokensData: {
    assetsAddresses: ['0xToken1', '0xToken2', '0xToken3'],
    lptokensAddresses: ['0xLPToken1', '0xLPToken2', '0xLPToken3'],
    priceFeedsAddresses: ['0xPriceFeed1', '0xPriceFeed2', '0xPriceFeed3'],
    assetsDecimalPlaces: [18, 6, 18],
    lptokensDecimalPlaces: [18, 18, 18],
    priceFeedsDecimalPlaces: [8, 8, 8],
    assetsSymbols: ['TOKEN1', 'TOKEN2', 'TOKEN3'],
    lptokensSymbols: ['lpTOKEN1', 'lpTOKEN2', 'lpTOKEN3']
  }
};

const pool = new RAMMPool();
pool.initializeWithData(poolConfigData, client, walletClient);
```

## Common Operations

### Querying Pool State

```typescript
// Get the current state of the pool
const poolState = await pool.getPoolState();
console.log('Asset Balances:', poolState.balances);
console.log('LP Tokens Issued:', poolState.LPTokensIssued);
console.log('Asset Prices:', poolState.prices);
```

### Deposits

#### Single Asset Deposit

```typescript
// Deposit a single asset
const depositParams = {
  tokenIndex: 0, // Index of the token to deposit
  amount: new BigNumber('1000000000000000000') // 1 TOKEN1 (in wei)
};

// Prepare the transaction
const tx = await pool.deposit(depositParams);

// Execute the transaction (if walletClient is provided)
const txHash = await tx.execute();
console.log('Deposit Transaction Hash:', txHash);
```

#### Multi-Asset Deposit

```typescript
// Deposit multiple assets
const multiDepositParams = {
  amounts: [
    new BigNumber('1000000000000000000'), // 1 TOKEN1 (in wei)
    new BigNumber('2000000'), // 2 TOKEN2 (with 6 decimals)
    new BigNumber('3000000000000000000')  // 3 TOKEN3 (in wei)
  ]
};

const tx = await pool.depositMultipleAssets(multiDepositParams);
const txHash = await tx.execute();
```

### Withdrawals

#### Single Asset Withdrawal

```typescript
// Withdraw a single asset by burning LP tokens
const withdrawalParams = {
  tokenIndex: 0, // Index of the token to withdraw
  amountLPT: new BigNumber('500000000000000000') // 0.5 LP tokens to burn
};

const tx = await pool.withdraw(withdrawalParams);
const txHash = await tx.execute();
```

#### Multi-Asset Withdrawal

```typescript
// Withdraw multiple assets proportionally
const multiWithdrawalParams = {
  amountsLPT: [
    new BigNumber('500000000000000000'), // 0.5 LP tokens for TOKEN1
    new BigNumber('300000000000000000'), // 0.3 LP tokens for TOKEN2
    new BigNumber('200000000000000000')  // 0.2 LP tokens for TOKEN3
  ]
};

const tx = await pool.withdrawMultipleAssets(multiWithdrawalParams);
const txHash = await tx.execute();
```

### Trading

#### Trade Given Input Amount

```typescript
// Trade TOKEN1 for TOKEN2 with a specified input amount
const tradeParams = {
  indexTokenIn: 0, // TOKEN1
  indexTokenOut: 1, // TOKEN2
  amount: new BigNumber('1000000000000000000') // 1 TOKEN1 (in wei)
};

// Get a quote first (optional)
const quote = await pool.quoteGivenIn(tradeParams);
console.log('Expected output:', quote.toString());

// Execute the trade
const tx = await pool.tradeGivenIn(tradeParams);
const txHash = await tx.execute();
```

#### Trade Given Output Amount

```typescript
// Trade TOKEN1 for TOKEN2 with a specified output amount
const tradeParams = {
  indexTokenIn: 0, // TOKEN1
  indexTokenOut: 1, // TOKEN2
  amount: new BigNumber('1000000') // 1 TOKEN2 (with 6 decimals)
};

// Get a quote first (optional)
const quote = await pool.quoteGivenOut(tradeParams);
console.log('Required input:', quote.toString());

// Execute the trade
const tx = await pool.tradeGivenOut(tradeParams);
const txHash = await tx.execute();
```

### Querying Wallet Balances

```typescript
// Get wallet balances for all assets in the pool
const walletAddress = '0xYourWalletAddress';
const balances = await pool.getWalletBalances(walletAddress);
console.log('Wallet Balances:', balances);

// Get LP token balances
const lpTokenBalances = await pool.getLPTokensAmounts(walletAddress);
console.log('LP Token Balances:', lpTokenBalances);
```

## Supported Networks

The SDK supports multiple EVM-compatible networks. You can use the `SupportedNetworks` enum:

```typescript
import { SupportedNetworks } from '@ramm/ramm-evm-sdk';

// Initialize a pool on Ethereum
const ethereumPool = new RAMMPool();
await ethereumPool.initialize({
  poolAddress: '0xYourPoolAddress',
  chainID: SupportedNetworks.ETHEREUM,
  client: ethereumClient
});

// Initialize a pool on Arbitrum
const arbitrumPool = new RAMMPool();
await arbitrumPool.initialize({
  poolAddress: '0xYourPoolAddress',
  chainID: SupportedNetworks.ARBITRUM,
  client: arbitrumClient
});
```

## Working with BigNumber

This SDK uses [bignumber.js](https://github.com/MikeMcl/bignumber.js/) for precise calculations, especially important when dealing with token amounts.

```typescript
import { BigNumber } from 'bignumber.js';

// Create a BigNumber from a string (recommended to avoid floating-point issues)
const amount = new BigNumber('1.5');

// Convert to wei (for 18 decimal tokens)
const amountInWei = amount.times(new BigNumber('1e18'));

// Format for display
const formattedAmount = amountInWei.div(new BigNumber('1e18')).toString();
```

## Environment Setup

Create a `.env` file based on the provided `.env.example`:

```
ALCHEMY_API_KEY=your_alchemy_api_key
PRIVATE_KEY=your_private_key
```

## Troubleshooting

### Common Issues

1. **Transaction Errors**:
   - Ensure you have enough gas and token allowance
   - Check that the wallet has approved the RAMM contract to spend tokens

2. **Connection Issues**:
   - Verify your RPC URL is correct and accessible
   - Ensure you're connecting to the correct network

3. **BigNumber Errors**:
   - Always use strings when creating BigNumber instances to avoid precision issues
   - Be mindful of token decimal places when calculating amounts

### Getting Help

If you encounter issues not covered here, please open an issue on the GitHub repository.

## License

[MIT](LICENSE)
