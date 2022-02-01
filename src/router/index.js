// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/Index.vue'
import Staking from '@/views/Staking'
import Transactions from '@/views/Transactions'
import Overview from '@/views/Overview'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index
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
    component: Staking,
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
