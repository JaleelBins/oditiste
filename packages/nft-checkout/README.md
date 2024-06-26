# @rarimo/nft-checkout
Features of the Rarimo SDK that create cross-chain transactions based on the Rarimo protocol.

![version (scoped package)](https://badgen.net/npm/v/@rarimo/nft-checkout)
![types](https://badgen.net/npm/types/@rarimo/nft-checkout)
![tree-shaking](https://badgen.net/bundlephobia/tree-shaking/@rarimo/nft-checkout)
![checks](https://badgen.net/github/checks/distributed-lab/web-kit/main)

## Example

For example applications, see [rarimo/js-sdk-examples](https://github.com/rarimo/js-sdk-examples/) on GitHub.

Here is an example of creating a transaction on the Goerli test chain:

```ts
import { createCheckoutOperation, EVMOperation, ChainNames, Price } from '@rarimo/nft-checkout'
import { createProvider } from '@rarimo/provider'
import { MetamaskProvider } from '@rarimo/providers-evm'
import { utils } from "ethers";

// Address of the NFT sale contract
const CONTRACT_ADDRESS = "0x77fedfb705c8bac2e03aad2ad8a8fe83e3e20fa1"

const sendTransaction = async () => {
  // Connect to the Metamask wallet in the browser using Web3.js, using the MetamaskProvider interface to limit bundle size.
  const provider = await createProvider(MetamaskProvider)

  // Initialize the object that represents the transaction operation, in this case on EVM.
  const op = createCheckoutOperation(EVMOperation, provider)

  // Get the chains that are supported from that chain type.
  const chains = await op.supportedChains()

  // Select the chain to pay from.
  // This example uses the Goerli chain, but your application can ask the user which chain to use.
  const selectedChain = chains.find(i => i.name === ChainNames.Goerli)

  // Set the parameters for the transaction, including the price and the tokens to accept payment in.
  const target = {
    // Destination chain id (Sepolia in this case)
    chainId: 11155111,
    // Recipient's wallet address
    recipient: "0x0000000000000000000000000000000000000000",
    price: Price.fromRaw("0.01", 18, 'ETH'),
    // The token to swap the payment token to
    swapTargetTokenSymbol: "WETH",
  }

  // Initialize the operation with the source chain and transaction parameters.
  await op.init({
    chainIdFrom: selectedChain!.id,
    target,
  })

  // Load the user's balance of payment tokens on the source chain.
  // When this method runs, the wallet prompts the user to switch to the selected chain if necessary.
  // Then, the method returns the tokens on this chain that the DEX supports and that the wallet has a balance of greater than zero.
  const tokens = await op.loadPaymentTokens(selectedChain!)

  // Select the token to accept payment in on the source chain.
  // This example hard-codes UNI, but your application can ask the user which token to pay with.
  const paymentToken = tokens[0]

  // Get the estimated purchase price in the payment token, including the cost to swap the tokens to the tokens that the seller accepts payment in.
  // At this point you can ask the user to confirm the transaction with the fees or cancel it.
  const estimatedPrice = await op.estimatePrice(paymentToken)

  // Create the transaction bundle, which includes custom logic that tells the Rarimo contract what to do after unlocking the transferred tokens on the destination chain, such as calling another contract to buy the NFT on the destination chain.
  // Optionally, you can set the bundle salt to be able to access the temporary contracts that Rarimo uses to run the bundled transactions.
  // See "Bundling" in the Rarimo documentation.

  // First, use the Ethers Interface to encode a command to add to the bundle.
  // This example encodes a command that purchases the NFT on the destination chain via the NFT contract's Application Binary Interface (ABI).
  // You can include other custom logic in the bundle.
  const encodedFunctionData = new utils
    .Interface(["function buy(address receiver_) payable"])
    .encodeFunctionData("buy", [
      target.recipient,
    ])

  // Then, create a bundle and add the purchase function.
  // The first parameter is the Solidity types of the values in the second parameter.
  // These parameters and their types are:
  // 1) The address of the contract that Rarimo will call to buy the NFT (`address[]`)
  // 2) The price of the NFT on the destination chain (`uint256[]`)
  // 3) The encoded purchase function (`bytes[]`)
  const bundle = utils.defaultAbiCoder.encode(
      ["address[]", "uint256[]", "bytes[]"],
      [
        [CONTRACT_ADDRESS],
        [target.price.value],
        [encodedFunctionData],
      ]
  );

  // Call the asynchronous checkout method to run the transaction.
  // The `checkout()` method takes the parameters from the operation instance, gets approval from the user's wallet, and calls the Rarimo contract to handle the transaction.
  const txHash = await op.checkout(estimatedPrice, { bundle })

  // Print a link to the transaction.
  console.log(provider.getTxUrl(selectedChain!, String(txHash)))
}
```

## Changelog

For the change log, see [CHANGELOG.md](https://github.com/rarimo/js-sdk/blob/main/CHANGELOG.md).
