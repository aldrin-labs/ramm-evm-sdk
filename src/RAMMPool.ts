import { ABI } from '../abi';

import { createPublicClient, http, getContract, parseGwei } from 'viem'

import { BigNumber } from 'bignumber.js';
import { poolData } from './interface';

export class RAMMPool {
  name: string;
  address: string;
  chainID: number;
  n: number; // number of assets
  client: any;
  walletClient: any;
  assetsAddresses: string[];
  LPTokenAddresses: string[];
  priceFeedAddresses: string[];
  rammContract: any;
  assetsDecimalPlaces: number[];
  LPTokensDecimalPlaces: number[];
  priceFeedsDecimalPlaces: number[];
  LPTokensList: string[];
  
  assetsList: string[];
  delta: number;
  baseFee: number;
  baseLeverage: number;
  protocolFee: number;
  rammParams: any;
  PriceFeedContractsList: any;
  LPTokenContractsList: any;
  tokenContractsList: any;

  constructor(
    poolAddress: string,
    chainID: number,
    poolName: string,
    poolNumberOfAssets: number,
    delta: number = 0.25,
    baseFee: number = 0.001,
    baseLeverage: number = 100,
    protocolFee: number = 0.5,
    publicClient: any,
    walletClient: any
    ) {
    this.name = poolName;
    this.address = poolAddress;
    this.chainID = chainID;
    this.n = poolNumberOfAssets;
    this.assetsAddresses = [];
    this.LPTokenAddresses = [];
    this.priceFeedAddresses = [];
    this.rammContract = null;
    this.assetsDecimalPlaces = [];
    this.LPTokensDecimalPlaces = [];
    this.priceFeedsDecimalPlaces = [];
    this.LPTokensList = [];
    this.assetsList = [];
    this.delta = delta;
    this.baseFee = baseFee;
    this.baseLeverage = baseLeverage;
    this.protocolFee = protocolFee;
    this.client = publicClient;
    this.walletClient = walletClient;
  }

  /**
   * Initializes the pool contracts (ramm, token, LPToken and priceFeed)
   * @param provider The provider to be used.
   */
  async initialize(chain: any, transport?: any ) {

    console.log("initialize:", this.name, this.address)

    if (!this.client) {
      const client = createPublicClient({
        chain,
        transport: transport ? transport : http()
      })
      this.client = client;
    }

    const ramm_address = this.address as `0x${string}`; // @ts-ignore
    const ramm_params = {
      address: ramm_address,
      abi: ABI.RAMM,
      publicClient: this.client,
      walletClient: this.client
    };
    this.rammParams = ramm_params;
    // @ts-ignore
    const RAMM_contract = getContract(ramm_params);
    this.rammContract = RAMM_contract;
    console.log('RAMM contract:', RAMM_contract?.address);
    // const rammLPtokens = await client.readContract({
    //   address: `0x${this.address.replace('0x', '')}`,
    //   abi: ABI.RAMM,
    //   functionName: 'lptokens'
    // })


    // We get the token, LP Token and priceFeed addresses from the ramm contract.
    this.assetsAddresses = [];
    this.LPTokenAddresses = [];
    this.priceFeedAddresses = [];

    for (let j = 0; j < this.n; j++) {
      // @ts-ignore-next-line: Let's ignore a compile error
      const tokAddr = (await RAMM_contract.read.assets({ args: [j] })) as unknown as string;
      this.assetsAddresses.push(tokAddr);
      // @ts-ignore-next-line: Let's ignore a compile error
      const lptokAddr = (await RAMM_contract.read.lptokens({ args: [j] })) as unknown as string;
      this.LPTokenAddresses.push(lptokAddr);
      // @ts-ignore-next-line: Let's ignore a compile error
      const priceFeedAddr = (await RAMM_contract.read.price_feeds({ args: [j] })) as unknown as string;
      this.priceFeedAddresses.push(priceFeedAddr);
    }
    console.log("assets:", this.assetsAddresses);

    // We get the token, LP Token and priceFeed contracts,
    // as well as the symbols for the assets and LP Tokens.
    this.tokenContractsList = [];
    this.LPTokenContractsList = [];
    this.PriceFeedContractsList = [];
    this.LPTokensList = [];

    for (let j = 0; j < this.n; j++) {
      const token_params = {
        address: this.assetsAddresses[j] as unknown as `0x${string}`,
        abi: ABI.TOKEN,
        publicClient: this.client,
        walletClient: this.client
      };
      // @ts-ignore
      const tokenContract = getContract(token_params);

      const args: [any] = [{ gasLimit: 60000 }];
      // @ts-ignore-next-line: Let's ignore a compile error
      const assetSymbol = (await tokenContract.read.symbol(null, args)) as any;

      this.tokenContractsList.push(tokenContract);
      this.assetsList.push(assetSymbol);
      // const lptokenSymbol = assetSymbol;
      // this.LPTokensList.push(lptokenSymbol);

      const price_feed_params = {
        address: this.priceFeedAddresses[j] as unknown as `0x${string}`, // @ts-ignore
        abi: ABI.PRICE_FEED,
        publicClient: this.client
      };
      // @ts-ignore
      const priceFeedContract = getContract(price_feed_params);
      console.log("priceFeedContract = ", priceFeedContract.address);
      this.PriceFeedContractsList.push(priceFeedContract);
    }

    // We get the number of decimal places of the tokens and LP Tokens, and the priceFeed addresses from the respective contracts.
    let assetsDecimals: number[] = [];
    let LPTokensDecimals: number[] = [];
    let priceFeedsDecimals: number[] = [];

    BigNumber.config({ EXPONENTIAL_AT: 36 });
    for (let j = 0; j < this.n; j++) {
      const token_contract_address = this.assetsAddresses[j] as `0x${string}`; // @ts-ignore
      const token_params = {
        address: token_contract_address, // @ts-ignore
        abi: ABI.TOKEN,
        publicClient: this.client,
        walletClient: this.client
      };
      // @ts-ignore
      const tokenContract = getContract(token_params);
      // @ts-ignore
      const dec1 = (await tokenContract.read.decimals()) as unknown as any;
      assetsDecimals.push(parseInt(dec1.toString()));

      const LPtoken_contract_address = this.LPTokenAddresses[j] as `0x${string}`; // @ts-ignore
      const LPtoken_params = {
        address: LPtoken_contract_address, // @ts-ignore
        abi: ABI.LP_TOKEN,
        publicClient: this.client,
        walletClient: this.client
      };
      // @ts-ignore
      const LPtokenContract = getContract(LPtoken_params); 
      const args: [any] = [{ gasLimit: 60000 }];
      // @ts-ignore
      const LPassetSymbol = (await LPtokenContract.read.symbol(null, args)) as any;
      this.LPTokensList.push(LPassetSymbol);
      // @ts-ignore
      const dec2 = (await LPtokenContract.read.decimals()) as unknown as any;
      this.LPTokenContractsList.push(LPtokenContract);
      LPTokensDecimals.push(parseInt(dec2.toString()));

      const priceFeed_contract_address = this.priceFeedAddresses[j] as `0x${string}`; // @ts-ignore
      const priceFeed_params = {
        address: priceFeed_contract_address, // @ts-ignore
        abi: ABI.PRICE_FEED,
        publicClient: this.client
      };

      // @ts-ignore
      const priceFeedContract = getContract(priceFeed_params); 
      // @ts-ignore
      const dec3 = (await priceFeedContract.read.decimals()) as unknown as any;

      priceFeedsDecimals.push(parseInt(dec3.toString()));
    }
    console.log("assetsDecimals", assetsDecimals);
    console.log("LPTokensDecimals", LPTokensDecimals);
    console.log("priceFeedsDecimals", priceFeedsDecimals);
    this.assetsDecimalPlaces = assetsDecimals;
    this.LPTokensDecimalPlaces = LPTokensDecimals;
    this.priceFeedsDecimalPlaces = priceFeedsDecimals;
  }

  /**
   * Initializes the pool contracts (ramm, token, LPToken and priceFeed) with the given data,
   * which includes the tokens' addresses, symbols, number of decimal places and the corresponding price feeds.
   * @param provider The provider to be used.
   * @param data The poolData to be used
   * @dev With this method we avoid having to retrieve the data from the blockchain and hence the pool is initialized without any delays.
   */

   initializeWithData(data: poolData) {
    console.log("initialize with data:", this.name, this.address);
  
    // Initialize contracts with the provided data
    const ramm_address = this.address as `0x${string}`;
    const ramm_params = {
      address: ramm_address,
      abi: ABI.RAMM,
      publicClient: this.client,
      walletClient: this.walletClient
    };
    // @ts-ignore
    this.rammContract = getContract(ramm_params);
  
    // Assign provided data to class fields
    this.assetsList = data.assetsSymbols;
    this.assetsAddresses = data.assetsAddresses;
    this.LPTokenAddresses = data.lptokensAddresses;
    this.LPTokensList = data.lptokensSymbols;
    this.priceFeedAddresses = data.priceFeedsAddresses;
    this.assetsDecimalPlaces = data.assetsDecimalPlaces;
    this.LPTokensDecimalPlaces = data.lptokensDecimalPlaces;
    this.priceFeedsDecimalPlaces = data.priceFeedsDecimalPlaces;
  
    // Initialize token, LP Token, and priceFeed contracts using data
    // @ts-ignore
    this.tokenContractsList = this.assetsAddresses.map(address => getContract({
      address: address as `0x${string}`,
      abi: ABI.TOKEN,
      publicClient: this.client,
      walletClient: this.walletClient
    }));
  
    // @ts-ignore
    this.LPTokenContractsList = this.LPTokenAddresses.map(address => getContract({ 
      address: address as `0x${string}`,
      abi: ABI.LP_TOKEN,
      publicClient: this.client,
      walletClient: this.walletClient
    }));
  
    // @ts-ignore
    this.PriceFeedContractsList = this.priceFeedAddresses.map(address => getContract({
      address: address as `0x${string}`,
      abi: ABI.PRICE_FEED,
      publicClient: this.client
    }));
  }
  

  async callERC20Token(tokenContractAddress: string, functionName: string, args?: any, params?: any): Promise<any>{
    const token_params = {
      address: tokenContractAddress, // @ts-ignore
      abi: ABI.TOKEN,
    };
    console.log(token_params.address, 
      functionName, 
      args,
      params);
    const response = (await this.client.readContract(
      { ...token_params, 
        functionName, 
        args,
        params
    })) as unknown as any;

    return response
  }

  async approve(tokenSymbol: string, address: string, amount: BigNumber, gasPrice: any = parseGwei('720.42069')) {
    const tokenAddress = this.assetsAddresses.find((sym) => sym === tokenSymbol) as string;
    const params = { gasLimit: 620_000, gasPrice };
    const tokenParams = {
      address: tokenAddress, // @ts-ignore
      abi: ABI.TOKEN,
      publicClient: this.client,
      walletClient: this.walletClient
    }

    // @ts-expect-error: Let's ignore a compile error
    const tokenContract = getContract(tokenParams); // @ts-ignore
    // console.log(tokenContract.address, tokenContract.abi, tokenContract.write.approve);
    const approve = await tokenContract.write.approve([address, amount], params) as any;
    // console.log('approve res', approve);
    return approve;
  }

  async liquidity_deposit(tokenIndex: number, amount: string, gasPrice: any = parseGwei('720.42069')) {
    console.log('liquidity_deposit', tokenIndex, amount);
    return await this.rammContract.write.liquidity_deposit([
      tokenIndex,
      amount
    ], {gasPrice});
  }

  async liquidity_withdrawal(tokenOut: number, amount: string, gasPrice: any = parseGwei('720.42069')) {
    return await this.rammContract.write.liquidity_withdrawal([tokenOut, amount], {gasPrice});
  }

  async trade_amount_in(tokenIn: number, tokenOut: number, amountIn: string, minAmount: string, gasPrice: any = parseGwei('720.42069')){
    return await this.rammContract.write.trade_amount_in([tokenIn, tokenOut, amountIn, minAmount], {gasPrice});
  }

  async trade_amount_out(tokenIn: number, tokenOut: number, amountOut: string, maxAmount: string, gasPrice: any = parseGwei('720.42069')){
    return await this.rammContract.write.trade_amount_out([tokenIn, tokenOut, amountOut, maxAmount], {gasPrice});
  }

  async getPoolState(): Promise<PoolState> {
    let balPromises: Promise<string>[] = [];
    let lptokPromises: Promise<string>[] = [];
    let pricesPromises: Promise<string>[] = [];

    for (let j = 0; j < this.n; j++) {
      const tokenDecimalPlaces = this.assetsDecimalPlaces[j];
      balPromises.push(
        this.balances(j).then((result: any) =>
          new BigNumber(result.toString()).div(10 ** tokenDecimalPlaces).toString()
        )
      );

      const LPTokenDecimalPlaces = this.LPTokensDecimalPlaces[j];
      lptokPromises.push(
        this.lp_tokens_issued(j).then((result: any) =>
          new BigNumber(result.toString()).div(10 ** LPTokenDecimalPlaces).toString()
        )
      );

      const priceContract = this.PriceFeedContractsList[j];
      //console.log('got price contract = ', priceContract.address, priceContract.read);
      const priceDecimalPlaces = this.priceFeedsDecimalPlaces[j];
      pricesPromises.push(
        priceContract.read.latestRoundData().then((result: any) =>
          new BigNumber(result[1].toString()).div(10 ** priceDecimalPlaces).toString()
        )
      );
    }

    const [balances, LPTokensIssued, prices] = await Promise.all([
      Promise.all(balPromises),
      Promise.all(lptokPromises),
      Promise.all(pricesPromises),
    ]);

    return { balances, LPTokensIssued, prices };
  }

  async balanceOf(arg0: string | string[], address: string, params: { gasLimit: number; } = { gasLimit: 1000 }) {
    let balance;
    if (typeof arg0 === 'string') {
      balance = (await this.callERC20Token(arg0, 'balanceOf', [address], params )) as unknown as string;
    } else if (arg0 != null && Array.isArray(arg0)) {
      balance = [];
      for (let i = 0; i < arg0.length; i++) {
        balance.push(await this.callERC20Token(arg0[i], 'balanceOf', [address], params )) as unknown as string; 
      }
    }
    return balance;
}
  async balances(j: number) {
    return await this.rammContract.read.balances([j]);
  }
  async lp_tokens_issued(j: number) {
    return await this.rammContract.read.lp_tokens_issued([j]);
  }
}

// Define types for input and output.
type PoolState = {
  balances: string[];
  LPTokensIssued: string[];
  prices: string[];
};

