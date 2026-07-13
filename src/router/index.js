import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', redirect: '/accounts' },
  { path: '/accounts', name: 'accounts', component: () => import('@/views/AccountsView.vue') },
  { path: '/transactions', name: 'transactions', component: () => import('@/views/TransactionsView.vue') },
  { path: '/transfer', name: 'transfer', component: () => import('@/views/TransferView.vue') },
  { path: '/insights', name: 'insights', component: () => import('@/views/InsightsView.vue') }
]

export const router = createRouter({
  history: createWebHistory(),
  routes
})
