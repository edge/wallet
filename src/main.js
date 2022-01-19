// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { createApp } from 'vue'
import App from './App.vue'
import Store from './store'
import router from './router'
import titleMixin from './mixins/titleMixin'
import './index.css'
import './utils'

const WALLET_REFRESH_INTERVAL = 30 * 1000

const init = async () => {
  const store = await Store.init()

  const app = createApp(App, { store })
    .use(router)
    .use(store)
    .mixin(titleMixin)
    .mixin({
      data() {
        return {
          isTestnet: process.env.VUE_APP_IS_TESTNET === 'true'
        }
      }
    })
    .mount('#app')

  if (store.state.locked) app.$router.replace('/')
  if (store.state.address) store.dispatch('refresh')
  setInterval(() => store.dispatch('backgroundRefresh', app.$router), WALLET_REFRESH_INTERVAL)
}

init()
