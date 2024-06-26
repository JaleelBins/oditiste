import type { Provider as EtherProvider } from '@ethersproject/providers'
import {
  Percent,
  Route,
  Token as PCToken,
  Trade,
  TradeType,
} from '@pancakeswap/sdk'
import { getAllCommonPairs } from '@pancakeswap/smart-router/evm'
import { CurrencyAmount } from '@pancakeswap/swap-sdk-core'
import type { IProvider } from '@rarimo/provider'

import { Price, Token } from '@/entities'
import type { Target } from '@/types'

import { handleNativeTokens } from './check-native-token'
import { getSwapAmount } from './get-swap-amount'
import { validateSlippage } from './slippage'

const PANCAKE_DEFAULT_SLIPPAGE = new Percent('5', '100')

const getSlippage = (slippage?: number): Percent => {
  if (!slippage) {
    return PANCAKE_DEFAULT_SLIPPAGE
  }

  validateSlippage(slippage)

  return new Percent(slippage, 1)
}

export const estimatePancakeSwap = async (
  tokens: Token[],
  provider: IProvider,
  _from: Token,
  _to: Token,
  target: Target,
) => {
  const { from, to } = handleNativeTokens(tokens, _from, _to)

  const tokenA = new PCToken(
    Number(from.chain.id),
    from.address,
    from.decimals,
    from.symbol,
    from.name,
  )

  const tokenB = new PCToken(
    Number(from.chain.id),
    to.address,
    to.decimals,
    to.symbol,
    to.name,
  )

  const amount = CurrencyAmount.fromRawAmount(
    tokenB,
    getSwapAmount(target.price),
  )

  const pairs = await getAllCommonPairs(tokenA, tokenB, {
    provider: () => provider?.getWeb3Provider?.() as EtherProvider,
  })

  const route = new Route(
    pairs.filter(
      p =>
        (p.token0.address === tokenA.address ||
          p.token1.address === tokenA.address) &&
        (p.token0.address === tokenB.address ||
          p.token1.address === tokenB.address),
    ),
    tokenA,
    tokenB,
  )
  const trade = new Trade(route, amount, TradeType.EXACT_OUTPUT)

  const maximumAmountInRaw = trade
    .maximumAmountIn(getSlippage(target.slippage))
    .quotient.toString()

  return {
    impact: trade.priceImpact.toSignificant(3),
    path: trade.route.path.map(token => token.address),
    from: _from,
    to: _to,
    price: Price.fromBigInt(maximumAmountInRaw, _from.decimals, _from.symbol),
  }
}
