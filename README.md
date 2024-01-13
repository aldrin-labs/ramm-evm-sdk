<div align="center">
  <img src="https://avatars.githubusercontent.com/u/60558183?s=200&v=4&width=500" alt="Logo" width="240">
  
  # Rebalancing Automated Market Maker (RAMM) EVM TypeScript SDK

  <p align="center">
    <br>
    This README provides an overview of the RAMM EVM TypeScript SDK, along with examples and documentation for its usage. Modify and extend the provided code according to your specific needs, and enjoy building with the Rebalancing AMM on Ethereum-based networks.
    <br />
    <br />
    <a href="https://discord.gg/aldrin">Discord</a>
  </p>
</div>

## Table Of Contents

  * [Features](#features)
    * [Installation](#installation)
    * [Examples](#examples)
      * [BalanceOf](#balanceof)
      * [CreateTrade](#createtrade)
      * [Deposit](#deposit)
      * [PoolState](#poolstate)
      * [Withdrawal](#withdrawal)

## Usage

``import { RAMMPool, liquidityDeposit, liquidityWithdrawal, tradeGivenIn, tradeGivenOut } from 'aldrin-labs/ramm-evm-sdk';
// Initialize RAMM Pool
const pool = new RAMMPool(poolAddress, chainID, poolName, numberOfAssets, delta, baseFee, baseLeverage, protocolFee, publicClient, walletClient);

// Initialize the pool contracts
await pool.initialize(chain, transport);

// Perform liquidity deposit
await liquidityDeposit(tokenIndex, depositAmount, signer, pool);

// Perform liquidity withdrawal
await liquidityWithdrawal(tokenIndex, amountLPT, pool, toConvertToWei);

// Perform trade (given amount in)
await tradeGivenIn(tokenIn, tokenOut, tradeAmount, minAmountOut, pool, doConvertToWei);

// Perform trade (given amount out)
await tradeGivenOut(tokenIn, tokenOut, tradeAmount, maxAmountIn, signer, pool, doConvertToWei);``

## API Reference
Class: RAMMPool
name: string
address: string
chainID: number
n: number
client: any
walletClient: any
assetsAddresses: string[]
LPTokenAddresses: string[]
priceFeedAddresses: string[]
rammContract: any
assetsDecimalPlaces: number[]
LPTokensDecimalPlaces: number[]
priceFeedsDecimalPlaces: number[]
LPTokensList: string[]
assetsList: string[]
delta, baseFee, baseLeverage, protocolFee: number
rammParams: object
PriceFeedContractsList, LPTokenContractsList, tokenContractsList: any[]

# Methods
initialize(chain: any, transport?: any): Promise<void>
initializeWithData(data: poolData): void
callERC20Token(tokenContractAddress: string, functionName: string, args?: any, params?: any): Promise<any>
approve(tokenSymbol: string, address: string, amount: BigNumber, gasPrice: any): Promise<any>
liquidity_deposit(tokenIndex: number, amount: string, gasPrice: any): Promise<any>
liquidity_withdrawal(tokenOut: number, amount: string, gasPrice: any): Promise<any>
trade_amount_in(tokenIn: number, tokenOut: number, amountIn: string, minAmount: string, gasPrice: any): Promise<any>
trade_amount_out(tokenIn: number, tokenOut: number, amountOut: string, maxAmount: string, gasPrice: any): Promise<any>
getPoolState(): Promise<PoolState>

# Module: transactions

# Functions
liquidityDeposit(tokenIn: number, depositAmount: BigNumber, signer: any, pool: RAMMPool, toConvertToWei: boolean, gasPrice: any): Promise<any>
liquidityWithdrawal(tokenOut: number, amountLPT: BigNumber, pool: RAMMPool, toConvertToWei: boolean, gasPrice: any): Promise<any>
tradeGivenIn(tokenIn: number, tokenOut: number, tradeAmount: BigNumber, minAmountOut: BigNumber, pool: RAMMPool, doConvertToWei: boolean, gasPrice: any): Promise<any>
tradeGivenOut(tokenIn: number, tokenOut: number, tradeAmount: BigNumber, maxAmountIn: BigNumber, signer: any, pool: RAMMPool, doConvertToWei: boolean, gasPrice: any): Promise<any>
multipleLiquidityDeposit(depositAmounts: BigNumber[], signer: any, pool: RAMMPool): Promise<any>
multipleLiquidityWithdrawal(amountsLPT: BigNumber[], signer: any, pool: RAMMPool, toConvertToWei: boolean): Promise<any>

