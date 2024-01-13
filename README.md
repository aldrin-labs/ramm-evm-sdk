# RAMM SDK for EVM Chains

## Introduction
The RAMM SDK is a straightforward wrapper for on-chain RAMM deployment, functioning as an Automated Market Maker (AMM). This toolkit simplifies interactions with blockchain-based AMMs, enabling developers to seamlessly integrate AMM functionalities into their decentralized applications (DApps).

## Features
- **Simplified AMM Interactions**: Streamline the process of interacting with AMM protocols on EVM-compatible blockchains.
- **Smart Contract Integration**: Facilitate direct interactions with smart contracts related to AMMs.
- **API Coverage**: Provide a comprehensive set of API endpoints to access AMM functionalities.
- **Network Configuration**: Support various EVM-compatible networks for broad compatibility.
- **Utility and Helper Functions**: Enhance ease of use with utility functions for common tasks and data formats.

## Key Components
- `config.ts`: Configuration settings for active blockchain networks.
- `networks.ts`: Definitions of supported networks and their configurations.
- `interface.ts`, `types.ts`: Interfaces and data types for organizing SDK operations.
- `utils.ts`: Utility functions for data handling and conversions.
- `transactions.ts`, `RAMMPool.ts`: Core functionalities for interacting with AMM pools and executing transactions.

## Installation
```bash
npm install ramm-evm-sdk
```

## API Usage

### Balance Query
```typescript
import { getWalletBalances, getLPTokensAmounts } from 'ramm-evm-sdk';

// Example usage of getLPTokensAmounts
const LPAmounts = getLPTokensAmounts(signer_account.address, [pool]);

// Example usage of getWalletBalances
const balances = getWalletBalances(signer_account.address, pool);
```

### Creating a Trade 
```typescript
import { tradeGivenIn, tradeGivenOut, fetchBalance } from 'ramm-evm-sdk';

// Fetch balance before trade
fetchBalance({address: signer_account.address, token: tokenOut, chainId: poly_ramm.chainID});

// Execute a trade with given in
tradeGivenIn(tokenIn, tokenOut, wmatic_amount_in, min_weth_amount_out, pool);

// Execute a trade with given out
tradeGivenOut(tokenIn, tokenOut, min_weth_amount_out, wmatic_amount_in, client, pool);
```

### Managing Liquidity
```typescript
import { liquidityDeposit, multipleLiquidityDeposit, fetchBalance } from 'ramm-evm-sdk';

// Fetch balance before deposit
fetchBalance({address: signer_account.address, token: WETH_INDEX, chainId: poly_ramm.chainID});

// Deposit liquidity
liquidityDeposit(wmatic_amount_deposit, weth_amount_deposit, usdc_amount_deposit, usdt_amount_deposit, walletClient, pool);

// Multiple liquidity deposits
multipleLiquidityDeposit([wmatic_amount_deposit, weth_amount_deposit, usdc_amount_deposit, usdt_amount_deposit], walletClient, pool);
```
### Pool State
```typescript
import { getPoolState } from 'ramm-evm-sdk';

// Get the state of a pool
getPoolState(pool);
```
### Liquidity Withdrawal
```typescript
import { liquidityWithdrawal, multipleLiquidityWithdrawal, fetchBalance } from 'ramm-evm-sdk';

// Fetch balance before withdrawal
fetchBalance({address: signer_account.address, token: WETH_INDEX, chainId: poly_ramm.chainID});

// Withdraw liquidity
liquidityWithdrawal(WETH_INDEX, LPweth_amount_withdraw, pool);

// Multiple liquidity withdrawals
multipleLiquidityWithdrawal([LPwmatic_amount_withdraw, LPweth_amount_withdraw, LPusdc_amount_withdraw, LPusdt_amount_withdraw], walletClient, pool);
```




