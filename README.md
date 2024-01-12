# RAMM Pool SDK
This repository contains the TypeScript SDK for interacting with a RAMM (Risk Adjusted Money Market) pool. RAMM is a pivotal component in the DeFi landscape, offering a dynamic approach to liquidity and asset management on the Ethereum/EVM blockchain.

It provides a set of tools and utilities to interact with the Ethereum/EVM blockchain and perform various DeFi operations.

## Structure

- `abi/`: ABIs for smart contracts, enabling Ethereum/EVM blockchain interactions.
- `src/`:
  - `constants/`: Configuration and network constants.
  - `interface/`: TypeScript interfaces and types.
  - `math/`: Utility functions for mathematical calculations.
  - `transactions/`: Transaction handling functions.
  - `RAMMPool.ts`: Core class for RAMM pool interactions.
- `tests/`: Test suite for application functionality.
- `index.ts`: Application entry point.
- `package.json`: Project dependencies and scripts.
- `env.example`: Template for environment setup. You need your Infura API KEY details added.
- `.eslintrc.json`: ESLint configuration for code consistency.
- `tsconfig.json`: Compiler options and project settings.


## Setup

1. Clone the repository.
2. Install dependencies with `yarn install`.
3. Copy `.env.example` to `.env` and fill in your environment variables.
4. Compile the TypeScript code with `tsc`.

## Usage

Import the `RAMMPool` class from `src/RAMMPool.ts` and create a new instance to interact with the RAMM pool.


## Testing

Run tests with `yarn test`.

## Contributing

Contributions are welcome. Please submit a pull request or create an issue to discuss the changes.

## License

This project is licensed under the MIT License.

## Disclaimer

The RAMM Pool SDK is provided "as is", without warranty of any kind, express or implied, including but not limited to the warranties of merchantability, fitness for a particular purpose, and noninfringement. In no event shall the authors, contributors, or copyright holders be liable for any claim, damages, or other liability, whether in an action of contract, tort, or otherwise, arising from, out of, or in connection with the software or the use or other dealings in the software. Use of this SDK is at your own risk and ensuring you comply with avaialable regulation in your jurisdiction is your sole responsibility as well.
