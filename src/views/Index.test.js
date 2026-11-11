import Index from './Index.vue'
import { createStore } from 'vuex'
import { afterEach, expect, it, vi } from 'vitest'
import { createApp, h, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
let app; let host
const button = text => [...host.querySelectorAll('button')].find(el => el.textContent.trim() === text)
afterEach(() => {
  app?.unmount(); host?.remove(); vi.unstubAllEnvs(); vi.unstubAllGlobals()
})
it('offers Ethereum claims without unlocking or resetting a saved Edge wallet', async () => {
  vi.stubEnv('VITE_ETHEREUM_CLAIMS_API_URL', 'http://127.0.0.1:18549/ethereum')
  vi.stubGlobal('fetch', async () => ({ ok: false, json: async () => ({ error: 'Test claims service offline' }) }))
  host = document.createElement('div'); document.body.append(host)
  const store = createStore({ state: { locked: true, hasWallet: true, address: 'xe_' + '33'.repeat(20), version: 2 } })
  app = createApp({ render: () => h(Index) }); app.use(store)
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/:pathMatch(.*)*', component: { render: () => null } }] })
  app.use(router); await router.push('/'); await router.isReady()
  app.mount(host); await nextTick()
  expect(host.querySelector('.modal h2')?.textContent).toContain('Unlock')
  button('Cancel').click(); await nextTick()
  expect(host.querySelector('.modal')).toBeNull()
  expect(button('Unlock wallet')).toBeDefined()
  button('Claim XE from Ethereum').click()
  await vi.waitFor(() => expect(host.textContent).toContain('Test claims service offline'))
  expect(store.state.locked).toBe(true)
  expect(store.state.hasWallet).toBe(true)
})
