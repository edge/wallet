import * as xe from '@edge/xe-utils'
import { createStore } from 'vuex'
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

  const address = await (async () => {
    try {
      return await getAddress(version)
    }
    catch (err) {
      console.debug(err)
      return ''
    }
  })()

  return createStore({
    state: {
      locked,
      version,

      address,
      balance: 0,
      nextNonce: 0,

      // TODO investigate whether we can set these in app mixin instead
      config: {
        blockchain: {
          baseURL: process.env.VUE_APP_BLOCKCHAIN_API_URL
        },
        index: {
          baseURL: process.env.VUE_APP_INDEX_API_URL
        }
      }
    },
    mutations: {
      lock(state) {
        state.locked = true
        expire()
      },
      reset(state) {
        state.locked = true
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
      setNextNonce(state, nextNonce) {
        state.nextNonce = nextNonce
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
      async refresh({ commit, state }) {
        if (!state.address) return
        if (state.locked) return
        const info = await xe.wallet.infoWithNextNonce(state.config.blockchain.baseURL, state.address)
        commit('setBalance', info.balance)
        commit('setNextNonce', info.nonce)
      }
    }
  })
}

export default {
  init
}
