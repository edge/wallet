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

import Vue from 'vue'
import VueRouter from 'vue-router'
import Index from '../views/Index.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/',
    name: 'Index',
    component: Index
  },
  {
    path: '/create',
    name: 'Create',
    component: () => import('../views/Create.vue')
  },
  {
    path: '/restore',
    name: 'Restore',
    component: () => import('../views/Restore.vue')
  }
]

const router = new VueRouter({
  mode: 'history',
  base: process.env.BASE_URL,
  routes
})

export default router
