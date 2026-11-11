import ClaimModal from './ClaimModal.vue'
import { createStore } from 'vuex'
import { afterEach, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, reactive } from 'vue'

let app; let host
const button = text => [...host.querySelectorAll('button')].find(el => el.textContent.trim() === text)
afterEach(() => {
  app?.unmount(); host?.remove(); vi.unstubAllGlobals(); vi.unstubAllEnvs()
})
it('allows a valid native claim to be reviewed and confirmed independently of the Ethereum form', async () => {
  vi.stubEnv('VITE_ETHEREUM_CLAIMS_API_URL', 'http://127.0.0.1:18549/ethereum')
  vi.stubGlobal('fetch', async url => ({ ok: true, json: async () => url.endsWith('/info') ? {
    open: true, minAmount: 1000000, confirmations: 3, claimsAddress: 'xe_' + '0'.repeat(40)
  } : { results: [] } }))
  host = document.createElement('div'); document.body.append(host)
  const props = reactive({ visible: false })
  const store = createStore({ state: { address: 'xe_' + '33'.repeat(20), balance: 10000000, nextNonce: 1 }, actions: {
    refresh() {}
  } })
  app = createApp({ render: () => h(ClaimModal, { ...props, close: () => {
    props.visible = false
  } }) })
  app.config.globalProperties.isTestnet = true
  app.use(store); app.mount(host); props.visible = true
  await vi.waitFor(() => expect(host.querySelector('#claim-xe-address')).not.toBeNull())
  for (const [selector, value] of [['#claim-xe-address', 'aa'.repeat(32)], ['#claim-amount', '1']]) {
    const input = host.querySelector(selector); input.value = value; input.dispatchEvent(new Event('input', { bubbles: true }))
  }
  host.querySelector('.claim-check input').click()
  await vi.waitFor(() => expect(button('Continue').disabled).toBe(false))
  button('Continue').click(); await nextTick()
  expect(host.textContent).toContain('Burn address')
  expect(host.textContent).toContain('cannot be refunded')
  const password = host.querySelector('#claim-pass'); password.value = 'test-password'; password.dispatchEvent(new Event('input', { bubbles: true }))
  await vi.waitFor(() => expect(button('Burn EDGE').disabled).toBe(false))
})
