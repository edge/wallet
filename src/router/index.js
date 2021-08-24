//                  $$\
//                  $$ |
//   $$$$$$\   $$$$$$$ | $$$$$$\   $$$$$$\
//  $$  __$$\ $$  __$$ |$$  __$$\ $$  __$$\
//  $$$$$$$$ |$$ /  $$ |$$ /  $$ |$$$$$$$$ |
//  $$   ____|$$ |  $$ |$$ |  $$ |$$   ____|
//  \$$$$$$$\ \$$$$$$$ |\$$$$$$$ |\$$$$$$$\
//   \_______| \_______| \____$$ | \_______|
//                      $$\   $$ |
// © 2021 Edge Network  \$$$$$$  |
//   Technologies Ltd.   \______/

import { createRouter, createWebHistory } from 'vue-router'
import Index from '../views/Index.vue'
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
    component: () => {},
    disabled: true
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
