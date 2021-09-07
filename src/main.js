// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import {createApp} from 'vue'
import App from './App.vue'
import router from './router'
import titleMixin from './mixins/titleMixin'
import './index.css'
import './utils'

createApp(App)
  .use(router)
  .mixin(titleMixin)
  .mount('#app')
