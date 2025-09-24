// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import './index.css'
import './utils'
import App from './App.vue'
import Store from './store'
import { createApp } from 'vue'
import router from './router'
import titleMixin from './mixins/titleMixin'

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
          isTestnet: import.meta.env.VITE_IS_TESTNET === 'true'
        }
      }
    })
    .mount('#app')

  app.$router.beforeResolve(to => {
    if (store.state.locked && to.name !== 'Index') return { name: 'Index' }
    return true
  })

  if (store.state.address) store.dispatch('refresh')
  store.dispatch('refreshIndexConfig')
  setInterval(() => store.dispatch('backgroundRefresh', app.$router), WALLET_REFRESH_INTERVAL)
}

init()
