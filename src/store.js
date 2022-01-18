import * as xe from '@edge/xe-utils'
import { createStore } from 'vuex'
import { getAddress, getWalletVersion } from './utils/storage'

const init = async () => {
  const version = await getWalletVersion()
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
      locked: true,
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
      }
    },
    actions: {
      async refresh({ commit, state }) {
        if (!state.address) return
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
