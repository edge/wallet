// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import * as xe from '@edge/xe-utils'
import { createStore } from 'vuex'
import { fetchTokenValue } from './utils/api'
import * as storage from './utils/storage'

// Module-scope abort controller for request cancellation
// Not in state because AbortController isn't serializable
let refreshAbortController = null

const init = async () => {
  const version = await storage.getWalletVersion()

  // Always start locked - user must enter password to unlock
  const locked = true

  // For v2, address is inside encrypted vault - can't retrieve without password
  // Address will be set when user unlocks
  const address = await (async () => {
    if (version === 2) return ''
    try {
      return await storage.getAddress(undefined, version)
    }
    catch (err) {
      console.debug(err)
      return ''
    }
  })()

  // If wallet-version exists (> 0), a wallet exists
  // empty() clears all keys including wallet-version
  const hasWallet = version > 0

  return createStore({
    state: {
      locked,
      version,
      hasWallet,

      address,
      balance: 0,
      nextNonce: 0,

      usdBalance: undefined,

      // TODO investigate whether we can set these in app mixin instead
      config: {
        blockchain: {
          baseURL: import.meta.env.VITE_BLOCKCHAIN_API_URL
        },
        index: {
          baseURL: import.meta.env.VITE_INDEX_API_URL
        }
      },

      bridgeOnline: false,

      // Multi-wallet support
      wallets: [],
      activeWalletId: null,
      transactionInProgress: false,
      sessionPassword: '',
      walletBalances: {},       // { walletId: balance } for dropdown display
      walletBalancesLoading: [] // wallet IDs currently being fetched
    },
    mutations: {
      lock(state) {
        state.locked = true
        state.sessionPassword = ''
      },
      reset(state) {
        state.locked = true
        state.hasWallet = false
        state.sessionPassword = ''
        state.address = ''
        state.balance = 0
        state.nextNonce = 0
        state.wallets = []
        state.activeWalletId = null
        state.walletBalances = {}
        state.walletBalancesLoading = []
      },
      setAddress(state, address) {
        state.address = address
      },
      setBalance(state, balance) {
        state.balance = balance
      },
      setBridgeOnline(state, online) {
        state.bridgeOnline = online
      },
      setNextNonce(state, nextNonce) {
        state.nextNonce = nextNonce
      },
      setUSDBalance(state, usdBalance) {
        state.usdBalance = usdBalance
      },
      setVersion(state, version) {
        state.version = version
      },
      unlock(state) {
        state.locked = false
        state.hasWallet = true
      },
      setWallets(state, wallets) {
        state.wallets = wallets
      },
      setActiveWalletId(state, walletId) {
        state.activeWalletId = walletId
      },
      setTransactionInProgress(state, inProgress) {
        state.transactionInProgress = inProgress
      },
      setSessionPassword(state, password) {
        state.sessionPassword = password
      },
      setWalletBalance(state, { walletId, balance }) {
        state.walletBalances = { ...state.walletBalances, [walletId]: balance }
      },
      setWalletBalancesLoading(state, walletIds) {
        state.walletBalancesLoading = walletIds
      },
      clearWalletBalances(state) {
        state.walletBalances = {}
        state.walletBalancesLoading = []
      }
    },
    getters: {
      activeWallet: (state) => {
        if (!state.activeWalletId || !state.wallets.length) return null
        return state.wallets.find(w => w.id === state.activeWalletId) || state.wallets[0]
      },
      walletCount: (state) => state.wallets.length,
      canSwitchWallet: (state) => !state.transactionInProgress && state.wallets.length > 1
    },
    actions: {
      async backgroundRefresh({ dispatch, state }) {
        if (state.locked) return
        dispatch('refresh')
      },
      forget({ commit }) {
        storage.empty()
        commit('reset')
      },
      async refresh({ commit, dispatch, state }) {
        if (!state.address) return
        if (state.locked) return

        // Cancel any previous in-flight request
        if (refreshAbortController) {
          refreshAbortController.abort()
        }

        // Create new abort controller for this request
        refreshAbortController = new AbortController()
        const signal = refreshAbortController.signal

        try {
          // Note: xe-utils doesn't support AbortController signal directly
          // We check signal.aborted after the await to handle cancellation
          const info = await xe.wallet.infoWithNextNonce(state.config.blockchain.baseURL, state.address)

          // Check if this request was aborted while waiting
          if (signal.aborted) return

          commit('setBalance', info.balance)
          commit('setNextNonce', info.nonce)
          dispatch('refreshTokenValue')
        } catch (err) {
          // Ignore abort errors - these are expected during wallet switching
          if (err.name === 'AbortError') return
          console.error('Refresh failed:', err)
        }
      },
      async refreshIndexConfig({ commit, state }) {
        const res = await fetch(`${state.config.index.baseURL}/v2/config`)
        if (!res.ok) {
          throw new Error('Unable to retrieve Bridge status from Index')
        }
        const data = await res.json()
        commit('setBridgeOnline', data.bridge && data.bridge.online)
      },
      async refreshTokenValue({ commit, state }) {
        const tokenValue = await fetchTokenValue()
        commit('setUSDBalance', tokenValue.usdPerXE * (state.balance / 1e6))
      },
      async switchWallet({ commit, dispatch, state }, walletId) {
        // Block switching during transaction signing
        if (state.transactionInProgress) {
          throw new Error('Cannot switch wallet while transaction is in progress')
        }

        // Cancel any in-flight refresh requests
        if (refreshAbortController) {
          refreshAbortController.abort()
          refreshAbortController = null
        }

        // Find the wallet to switch to
        const wallet = state.wallets.find(w => w.id === walletId)
        if (!wallet) {
          throw new Error(`Wallet not found: ${walletId}`)
        }

        // Update Vuex state
        commit('setActiveWalletId', walletId)
        commit('setAddress', wallet.address)

        // Reset balance/nonce (will be fetched fresh)
        commit('setBalance', 0)
        commit('setNextNonce', 0)
        commit('setUSDBalance', undefined)

        // Persist active wallet selection (plain storage, no password needed)
        await storage.setActiveWalletId(walletId)

        // Fetch new wallet's balance
        dispatch('refresh')
      },
      async loadWallets({ commit, state }, password) {
        // Only works with v2 storage
        if (state.version !== 2) {
          // For v0/v1, create a single wallet entry from current address
          commit('setWallets', [{
            id: 'legacy',
            name: 'Wallet 1',
            address: state.address
          }])
          commit('setActiveWalletId', 'legacy')
          return
        }

        try {
          const wallets = await storage.getWallets(password)
          if (!wallets.length) return

          commit('setWallets', wallets)
          commit('setSessionPassword', password)

          // Restore persisted active wallet, or use first wallet
          const persistedActiveId = await storage.getActiveWalletId()
          const activeWallet = wallets.find(w => w.id === persistedActiveId) || wallets[0]

          if (activeWallet) {
            commit('setActiveWalletId', activeWallet.id)
            commit('setAddress', activeWallet.address)
            await storage.setActiveWalletId(activeWallet.id)
          }
        } catch (err) {
          console.error('Failed to load wallets:', err)
        }
      },
      async fetchAllWalletBalances({ commit, state }) {
        if (!state.wallets.length) return

        // Mark all as loading
        const walletIds = state.wallets.map(w => w.id)
        commit('setWalletBalancesLoading', walletIds)

        // Fetch balances in parallel
        const results = await Promise.allSettled(
          state.wallets.map(async (wallet) => {
            try {
              const info = await xe.wallet.infoWithNextNonce(state.config.blockchain.baseURL, wallet.address)
              return { walletId: wallet.id, balance: info.balance }
            } catch (err) {
              console.error(`Failed to fetch balance for ${wallet.address}:`, err)
              return { walletId: wallet.id, balance: 0 }
            }
          })
        )

        // Update balances
        results.forEach(result => {
          if (result.status === 'fulfilled') {
            commit('setWalletBalance', result.value)
          }
        })

        // Clear loading state
        commit('setWalletBalancesLoading', [])
      },
      async removeWallet({ commit, dispatch, state }, { walletId, password }) {
        // Block removal during transaction signing
        if (state.transactionInProgress) {
          throw new Error('Cannot remove wallet while transaction is in progress')
        }

        // Cancel any in-flight refresh requests
        if (refreshAbortController) {
          refreshAbortController.abort()
          refreshAbortController = null
        }

        // Remove wallet from vault
        const result = await storage.removeWallet(walletId, password)

        // If no wallets remain, clear state
        if (result.walletsRemaining === 0) {
          commit('setWallets', [])
          commit('setActiveWalletId', null)
          commit('setAddress', '')
          commit('setBalance', 0)
          commit('setNextNonce', 0)
          commit('setUSDBalance', undefined)
          return true
        }

        // Refresh wallet list from vault
        await dispatch('loadWallets', password)

        return true
      }
    }
  })
}

export default {
  init
}
