import AccountPanel from './AccountPanel.vue'
import { createStore } from 'vuex'
import { saveActiveClaim } from '../utils/claim'
import { afterEach, expect, it, vi } from 'vitest'
import { createApp, h } from 'vue'
vi.hoisted(() => {
  vi.stubEnv('VITE_CLAIMS_API_URL', 'http://127.0.0.1:18549')
})
let app; let host
afterEach(() => {
  app?.unmount(); host?.remove(); localStorage.clear(); vi.unstubAllGlobals(); vi.unstubAllEnvs()
})
it('keeps a saved native claim receipt accessible after new claims close', async () => {
  const address = 'xe_' + '33'.repeat(20)
  saveActiveClaim(address, { sender: address, ref: '11'.repeat(32), hash: 'ab'.repeat(32), amount: 1000000, xeAddress: 'aa'.repeat(32) })
  vi.stubGlobal('fetch', async () => ({ ok: true, json: async () => ({ open: false }) }))
  host = document.createElement('div'); document.body.append(host)
  app = createApp({ render: () => h(AccountPanel) })
  app.use(createStore({ state: { address, balance: 10000000, usdBalance: 0 } })); app.mount(host)
  await vi.waitFor(() => expect(host.textContent).toContain('View claim receipt'))
})
