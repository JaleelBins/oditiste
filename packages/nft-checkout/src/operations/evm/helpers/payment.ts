import { BN } from '@distributedlab/tools'
import type { IProvider } from '@rarimo/provider'
import {
  BalanceResult,
  getBalancesForEthereumAddress,
  Token as TokenInfo,
} from 'ethereum-erc20-token-balances-multicall'

import { Amount, PaymentToken, Token } from '@/entities'
import type { BridgeChain } from '@/types'

const mapTokenBalances = (
  supportedTokens: Token[],
  balances: BalanceResult,
): PaymentToken[] => {
  if (!balances.tokens) return []

  return balances.tokens.reduce((acc, token) => {
    const paymentToken = createPaymentToken(supportedTokens, token)
    if (paymentToken) acc.push(paymentToken)
    return acc
  }, [] as PaymentToken[])
}

const getTokenByAddress = (
  tokens: Token[],
  address: string,
): Token | undefined => {
  return tokens.find(i => i.address === address)
}

const createPaymentToken = (
  supportedTokens: Token[],
  token: TokenInfo,
): PaymentToken | undefined => {
  const internalToken = getTokenByAddress(
    supportedTokens,
    token.contractAddress,
  )

  if (!internalToken || !token.decimals) return

  if (BN.fromBigInt(token.balance, token.decimals).isZero) return

  return PaymentToken.fromToken(
    internalToken,
    Amount.fromBigInt(token.balance, token.decimals),
  )
}

export const getPaymentTokens = async (
  chain: BridgeChain,
  provider: IProvider,
  tokens: Token[],
): Promise<PaymentToken[]> => {
  const erc20 = mapTokenBalances(
    tokens,
    await getBalancesForEthereumAddress({
      contractAddresses: tokens.reduce((acc: string[], i) => {
        if (i.address) acc.push(i.address)
        return acc
      }, []),
      ethereumAddress: provider.address!,
      providerOptions: { ethersProvider: provider?.getWeb3Provider?.() },
      formatBalances: false,
    }),
  )

  const _provider = provider.getWeb3Provider?.()
  const nativeBalance = await _provider?.getBalance(provider.address!)

  return [
    ...erc20,
    ...(nativeBalance && nativeBalance.gt(0)
      ? [
          PaymentToken.fromToken(
            Token.fromChain(chain),
            Amount.fromBigInt(nativeBalance.toString(), chain.token.decimals),
          ),
        ]
      : []),
  ]
}
