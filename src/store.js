// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import * as xe from '@edge/xe-utils'
import { createStore } from 'vuex'
import { fetchTokenValue } from './utils/api'
import {
  empty,
  expire,
  getAddress,
  getUnlockExpiry,
  getWalletVersion,
  setUnlockExpiry
} from './utils/storage'

const WALLET_EXPIRY = 5 * 60 * 1000

const init = async () => {
  const version = await getWalletVersion()

  const expires = await getUnlockExpiry()
  const locked = expires.getTime() < Date.now()

  // For v2, address is inside encrypted vault - can't retrieve without password
  // Address will be set when user unlocks
  const address = await (async () => {
    if (version === 2) return ''
    try {
      return await getAddress(undefined, version)
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

      bridgeOnline: false
    },
    mutations: {
      lock(state) {
        state.locked = true
        expire()
      },
      reset(state) {
        state.locked = true
        state.hasWallet = false
        state.address = ''
        state.balance = 0
        state.nextNonce = 0
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
        setUnlockExpiry(new Date(Date.now() + WALLET_EXPIRY))
      }
    },
    actions: {
      async backgroundRefresh({ commit, dispatch, state }, router) {
        const expires = await getUnlockExpiry()
        const locked = expires.getTime() < Date.now()

        if (locked) {
          if (!state.locked) {
            commit('lock')
            router.push('/')
          }
        }
        else {
          // postpones expiry
          commit('unlock')
          dispatch('refresh')
        }
      },
      forget({ commit }) {
        empty()
        commit('reset')
      },
      async refresh({ commit, dispatch, state }) {
        if (!state.address) return
        if (state.locked) return
        const info = await xe.wallet.infoWithNextNonce(state.config.blockchain.baseURL, state.address)
        commit('setBalance', info.balance)
        commit('setNextNonce', info.nonce)
        dispatch('refreshTokenValue')
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
      }
    }
  })
}

export default {
  init
}
