const mockCreateApolloClient = jest.fn()
const mockRestartWebsockets = jest.fn()

jest.mock('vue-cli-plugin-apollo/graphql-client', () => ({
  createApolloClient: (...args) => mockCreateApolloClient(...args),
  restartWebsockets: (...args) => mockRestartWebsockets(...args),
}))

import { createProvider, onLogin, onLogout } from '@/vue-apollo'

const AUTH_TOKEN = 'apollo-token'

function makeClient() {
  return {
    wsClient: { id: 'ws' },
    resetStore: jest.fn().mockResolvedValue(undefined),
  }
}

describe('vue-apollo', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    localStorage.clear()
  })

  describe('createProvider', () => {
    it('builds an apollo client with the default http endpoint and attaches wsClient', () => {
      const apolloClient = {}
      mockCreateApolloClient.mockReturnValue({ apolloClient, wsClient: { id: 'ws' } })

      const provider = createProvider()

      expect(mockCreateApolloClient).toHaveBeenCalledTimes(1)
      const passedOptions = mockCreateApolloClient.mock.calls[0][0]
      expect(passedOptions.httpEndpoint).toBe('https://graphqlzero.almansi.me/api')
      expect(passedOptions.tokenName).toBe(AUTH_TOKEN)
      expect(passedOptions.wsEndpoint).toBeNull()
      expect(apolloClient.wsClient).toEqual({ id: 'ws' })
      expect(provider.defaultClient).toBe(apolloClient)
    })

    it('merges caller supplied options over the defaults', () => {
      mockCreateApolloClient.mockReturnValue({ apolloClient: {}, wsClient: null })

      createProvider({ httpEndpoint: 'https://example.test/graphql' })

      const passedOptions = mockCreateApolloClient.mock.calls[0][0]
      expect(passedOptions.httpEndpoint).toBe('https://example.test/graphql')
    })

    it('logs a formatted message through the error handler', () => {
      mockCreateApolloClient.mockReturnValue({ apolloClient: {}, wsClient: null })
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {})

      const provider = createProvider()
      provider.errorHandler({ message: 'boom' })

      expect(spy).toHaveBeenCalled()
      expect(spy.mock.calls[0].join(' ')).toContain('boom')
      spy.mockRestore()
    })
  })

  describe('onLogin', () => {
    it('stores the token, restarts websockets and resets the store', async () => {
      const client = makeClient()

      await onLogin(client, 'my-token')

      expect(localStorage.getItem(AUTH_TOKEN)).toBe('my-token')
      expect(mockRestartWebsockets).toHaveBeenCalledWith(client.wsClient)
      expect(client.resetStore).toHaveBeenCalledTimes(1)
    })

    it('does not store a token when none is provided', async () => {
      const client = makeClient()

      await onLogin(client, undefined)

      expect(localStorage.getItem(AUTH_TOKEN)).toBeNull()
      expect(client.resetStore).toHaveBeenCalledTimes(1)
    })

    it('skips restarting websockets when the client has none', async () => {
      const client = { resetStore: jest.fn().mockResolvedValue(undefined) }

      await onLogin(client, 'token')

      expect(mockRestartWebsockets).not.toHaveBeenCalled()
    })

    it('swallows errors thrown by resetStore', async () => {
      const client = {
        wsClient: null,
        resetStore: jest.fn().mockRejectedValue(new Error('reset failed')),
      }
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {})

      await expect(onLogin(client, 'token')).resolves.toBeUndefined()
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })
  })

  describe('onLogout', () => {
    it('removes the token, restarts websockets and resets the store', async () => {
      localStorage.setItem(AUTH_TOKEN, 'stale')
      const client = makeClient()

      await onLogout(client)

      expect(localStorage.getItem(AUTH_TOKEN)).toBeNull()
      expect(mockRestartWebsockets).toHaveBeenCalledWith(client.wsClient)
      expect(client.resetStore).toHaveBeenCalledTimes(1)
    })

    it('skips restarting websockets when the client has none', async () => {
      const client = { resetStore: jest.fn().mockResolvedValue(undefined) }

      await onLogout(client)

      expect(mockRestartWebsockets).not.toHaveBeenCalled()
    })

    it('swallows errors thrown by resetStore', async () => {
      const client = {
        wsClient: null,
        resetStore: jest.fn().mockRejectedValue(new Error('reset failed')),
      }
      const spy = jest.spyOn(console, 'log').mockImplementation(() => {})

      await expect(onLogout(client)).resolves.toBeUndefined()
      expect(spy).toHaveBeenCalled()
      spy.mockRestore()
    })
  })
})
