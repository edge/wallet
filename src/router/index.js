// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import Index from '../views/Index.vue'
import Nodes from '@/views/Nodes.vue'
import Overview from '@/views/Overview.vue'
import Staking from '@/views/Staking.vue'
import Transactions from '@/views/Transactions.vue'
import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index
  },
  {
    path: '/nodes',
    name: 'Nodes',
    component: Nodes
  },
  {
    path: '/overview',
    name: 'Overview',
    component: Overview
  },
  {
    path: '/transactions/:page(\\d+)?',
    name: 'Transactions',
    component: Transactions
  },
  {
    path: '/governance',
    name: 'Governance',
    component: () => {},
    disabled: true
  },
  {
    path: '/staking',
    name: 'Staking',
    component: Staking
  }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_BASE_URL),
  routes
})

export default router
