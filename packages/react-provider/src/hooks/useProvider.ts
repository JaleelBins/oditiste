import {
  Chain,
  ChainId,
  createProvider,
  CreateProviderOpts,
  IProvider,
  ProviderBase,
  ProviderEventPayload,
  ProviderProxyConstructor,
  TransactionRequestBody,
  TransactionResponse,
} from '@rarimo/provider'
import { useCallback, useEffect, useState } from 'react'

const PROVIDER_EVENTS: Array<keyof IProvider> = [
  'onInitiated',
  'onConnect',
  'onAccountChanged',
  'onChainChanged',
  'onDisconnect',
]

interface useProviderReturnType extends ProviderBase {
  provider: IProvider
}
/**
 * @description A React hook that creates a provider object with access to the user's wallet
 *
 * @example
 * ```ts
 * const { provider, ...rest } = useProvider(MetamaskProvider)
 * provider?.connect()
 * console.log(provider?.address)
 * ```
 *
 * @param providerProxy The type of provider from the appropriate package, such as {@link @rarimo/providers-evm!MetamaskProvider}
 * @param createProviderOpts Options for the connection
 */
export const useProvider = (
  providerProxy: ProviderProxyConstructor,
  createProviderOpts?: CreateProviderOpts,
): useProviderReturnType => {
  const [provider, setProvider] = useState<IProvider>({} as IProvider)
  const [providerReactiveState, setProviderReactiveState] = useState(() => {
    return {
      address: provider?.address,
      isConnected: provider?.isConnected,
      chainId: provider?.chainId,
      chainType: provider?.chainType,
      providerType: provider?.providerType,
    }
  })
  const connect = async (): Promise<void> => provider.connect()

  const addChain = async (chain: Chain): Promise<void> =>
    provider.addChain?.(chain)

  const switchChain = async (chainId: ChainId): Promise<void> =>
    provider.switchChain(chainId)

  const signAndSendTx = async (
    txRequestBody: TransactionRequestBody,
  ): Promise<TransactionResponse> =>
    provider.signAndSendTx?.(txRequestBody) ?? ''

  const signMessage = async (message: string): Promise<string> =>
    provider.signMessage?.(message) ?? ''

  const getHashFromTx = (txResponse: TransactionResponse): string =>
    provider.getHashFromTx?.(txResponse) ?? ''

  const getTxUrl = (chain: Chain, txHash: string): string =>
    provider.getTxUrl?.(chain, txHash) ?? ''

  const getAddressUrl = (chain: Chain, address: string): string =>
    provider.getAddressUrl?.(chain, address) ?? ''

  const setListeners = useCallback(() => {
    if (!provider) return
    PROVIDER_EVENTS.forEach(event => {
      const providerEvent = provider[event] as (
        cb: (payload: ProviderEventPayload) => void,
      ) => void

      providerEvent?.call(provider, payload => {
        setProviderReactiveState(prev => ({
          ...prev,
          ...payload,
        }))
      })
    })
  }, [provider])

  useEffect(() => {
    const initProvider = async () => {
      const initedProvider = await createProvider(
        providerProxy,
        createProviderOpts,
      )
      setProvider(initedProvider)
    }

    initProvider()
  }, [providerProxy, createProviderOpts])

  useEffect(() => {
    provider?.clearHandlers?.()
    setListeners()
    setProviderReactiveState(prev => ({
      ...prev,
      address: provider?.address,
      isConnected: provider?.isConnected,
      chainId: provider?.chainId,
      chainType: provider?.chainType,
      providerType: provider?.providerType,
    }))
    return () => {
      provider?.clearHandlers?.()
    }
  }, [provider, setListeners])

  return {
    provider,
    ...providerReactiveState,
    connect,
    addChain,
    switchChain,
    signMessage,
    signAndSendTx,
    getTxUrl,
    getHashFromTx,
    getAddressUrl,
  }
}
