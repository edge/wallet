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
import Sample from '@/views/Sample'

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index
  },
  {
    path: '/transactions',
    name: 'Transactions',
    component: Transactions
  },
  {
    path: '/transaction/:id',
    name: 'Transaction',
    component: Transactions
  },
  {
    path: '/overview',
    name: 'Overview',
    component: Overview
  },
  {
    path: '/sample',
    name: 'Sample',
    component: Sample
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
