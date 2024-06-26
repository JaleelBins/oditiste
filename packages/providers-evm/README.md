# @rarimo/providers-evm
Features of the Rarimo SDK that provide access to wallets and the ability to interact with them on EVM-compatible blockchains.

![version (scoped package)](https://badgen.net/npm/v/@rarimo/providers-evm)
![types](https://badgen.net/npm/types/@rarimo/providers-evm)
![tree-shaking](https://badgen.net/bundlephobia/tree-shaking/@rarimo/providers-evm)
![checks](https://badgen.net/github/checks/rarimo/js-sdk/main)

## Example

For example applications, see [rarimo/js-sdk-examples](https://github.com/rarimo/js-sdk-examples/) on GitHub.

Here is an example that creates a `MetamaskProvider` object for a MetaMask wallet and prints its address:

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
