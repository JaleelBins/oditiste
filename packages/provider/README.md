# @rarimo/provider
A common interface for access to wallets (EVM and non-EVM) in the Rarimo SDK, used by packages that provide access to wallets on specific chains such as @rarimo/providers-evm, @rarimo/providers-solana, and @rarimo/providers-near.

To connect to wallets, use both this package and the specific implementation of a wallet provider from one of these packages:

- `@rarimo/providers-evm`: access to Metamask and Coinbase wallets on EVM-compatible chains
- `@rarimo/providers-near`: access to NEAR wallets on the NEAR chain
- `@rarimo/providers-solana`: access to Phantom and Solflare wallets on the Solana chain

![version (scoped package)](https://badgen.net/npm/v/@rarimo/provider)
![types](https://badgen.net/npm/types/@rarimo/provider)
![tree-shaking](https://badgen.net/bundlephobia/tree-shaking/@rarimo/provider)
![checks](https://badgen.net/github/checks/rarimo/js-sdk/main)

## Example

For example applications, see [rarimo/js-sdk-examples](https://github.com/rarimo/js-sdk-examples/) on GitHub.

Here is an example that creates a `MetamaskProvider` object from `@rarimo/providers-evm` to represent a MetaMask wallet and prints its address:

```js
import { createProvider } from '@rarimo/provider'
import { MetamaskProvider } from '@rarimo/providers-evm'

const getMetamaskWalletAddress = async () => {
  // Connect to the Metamask wallet in the browser using Web3.js, using the MetamaskProvider interface to limit bundle size.
  const provider = await createProvider(MetamaskProvider)
  await provider.connect()

  // Get the address of the wallet
  console.log(provider.address)
}
```

## Changelog

For the change log, see [CHANGELOG.md](https://github.com/rarimo/js-sdk/blob/main/CHANGELOG.md).
