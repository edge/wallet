import EthereumClaimModal from './EthereumClaimModal.vue'
import edgeRuntime from '../../utils/fixtures/edge-runtime.hex?raw'
import { ethers } from 'ethers'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, h, nextTick, reactive } from 'vue'
import { encodeClaimTransfer, ethereumClaimStorageKey } from '../../utils/ethereum-claim'

const sender = '0x3333333333333333333333333333333333333333'
const code = edgeRuntime.trim()
const info = {
  open: true, rehearsal: true, chainId: '0x7a69', chainName: 'EDGE Claim Rehearsal',
  confirmations: 2, minAmount: '1000000000000000000', tokenAddress: '0x4ec1b60b96193a64acae44778e51f7bff2007831',
  claimsAddress: '0x000000000000000000000000000000000000dead', tokenCodeHash: ethers.utils.keccak256(code)
}
let app; let chainId; let corrupt; let host; let pending; let reject; let sent; let stage
const button = text => [...host.querySelectorAll('button')].find(el => el.textContent.includes(text))
async function fill(selector, value) {
  const input = host.querySelector(selector)
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await nextTick()
}
async function mount(expected = 'Local rehearsal') {
  host = document.createElement('div')
  document.body.append(host)
  const props = reactive({ visible: false })
  app = createApp({ render: () => h(EthereumClaimModal, { ...props, close: () => {
    props.visible = false
  } }) })
  app.mount(host)
  props.visible = true
  await vi.waitFor(() => expect(host.textContent).toContain(expected))
  return props
}
async function ready() {
  await mount()
  button('Connect wallet').click()
  await vi.waitFor(() => expect(host.textContent).toContain(sender))
  await fill('#ethereum-claim-xe-address', 'aa'.repeat(32))
  await fill('#ethereum-claim-amount', '1')
  host.querySelector('#ethereum-claim-checked').click()
  await vi.waitFor(() => expect(button('Continue').disabled).toBe(false))
  button('Continue').click()
  await nextTick()
}

beforeEach(() => {
  localStorage.clear()
  pending = null; sent = []; chainId = '0x7a69'; reject = false; corrupt = false; stage = 'awaiting_transfer'
  vi.stubEnv('VITE_ETHEREUM_CLAIMS_API_URL', 'http://127.0.0.1:18549/ethereum')
  window.ethereum = {
    on: vi.fn(), removeListener: vi.fn(),
    request: async ({ method, params }) => {
      if (method === 'eth_requestAccounts' || method === 'eth_accounts') return [sender]
      if (method === 'eth_chainId') return chainId
      if (method === 'eth_getCode') return code
      if (method === 'eth_getTransactionReceipt') return null
      if (method === 'eth_call') return ethers.utils.hexZeroPad(ethers.utils.parseEther('10').toHexString(), 32)
      if (method === 'eth_sendTransaction') {
        if (reject) throw Object.assign(new Error('User rejected'), { code: 4001 })
        sent.push(params[0]); return `0x${'ab'.repeat(32)}`
      }
      throw new Error(`Unexpected provider method: ${method}`)
    }
  }
  vi.stubGlobal('fetch', async (url, options = {}) => {
    let body
    if (url.endsWith('/info')) body = info
    else if (options.method === 'POST' && url.endsWith('/claims')) {
      pending = { ...info, ...JSON.parse(options.body), ref: '11'.repeat(32), status: 'awaiting_transfer' }
      body = corrupt ? { ...pending, xeAddress: 'bb'.repeat(32) } : pending
      if (!corrupt) {
        body = { ...body }
        delete body.xeAddress
      }
    }
    else if (url.endsWith('/transaction')) body = pending
    else {
      body = { ...pending, status: stage }
      delete body.xeAddress
    }
    return { ok: true, json: async () => body }
  })
})
afterEach(() => {
  app?.unmount(); host?.remove(); vi.unstubAllGlobals(); vi.unstubAllEnvs(); delete window.ethereum
})

describe('Ethereum claim confirmation', () => {
  it('connects the browser wallet without exposing rehearsal tools', async () => {
    await mount()
    expect(button('Connect wallet')).toBeDefined()
    expect(host.textContent).not.toContain('Use local test wallet')
    expect(host.textContent).not.toContain('Get test EDGE and ETH')
    button('Connect wallet').click()
    await vi.waitFor(() => expect(host.textContent).toContain(sender))
    expect(host.textContent).toContain('10.0')
    expect(sent).toHaveLength(0)
  })
  it('keeps the form connected when the wallet repeats the selected network and account', async () => {
    await mount()
    button('Connect wallet').click()
    await vi.waitFor(() => expect(host.textContent).toContain(sender))
    const networkChanged = window.ethereum.on.mock.calls.find(([event]) => event === 'chainChanged')[1]
    const accountsChanged = window.ethereum.on.mock.calls.find(([event]) => event === 'accountsChanged')[1]
    networkChanged('0x7a69')
    accountsChanged([sender])
    await nextTick()
    expect(host.textContent).toContain(sender)
    expect(host.querySelector('#ethereum-claim-xe-address')).not.toBeNull()
  })
  it('validates the destination, balance and acknowledgement before review', async () => {
    await mount()
    button('Connect wallet').click()
    await vi.waitFor(() => expect(host.textContent).toContain(sender))
    await fill('#ethereum-claim-xe-address', 'xe_old-address')
    await fill('#ethereum-claim-amount', '11')
    host.querySelector('#ethereum-claim-checked').click()
    await vi.waitFor(() => expect(host.textContent).toContain('Insufficient funds'))
    expect(host.textContent).toContain('An Edge address')
    expect(button('Continue').disabled).toBe(true)
    await fill('#ethereum-claim-xe-address', 'aa'.repeat(32))
    expect(button('Continue').disabled).toBe(true)
    host.querySelector('label[for="ethereum-claim-max"]').click()
    await vi.waitFor(() => expect(button('Continue').disabled).toBe(false))
    expect(host.querySelector('#ethereum-claim-amount').value).toBe('10.0')
    host.querySelector('#ethereum-claim-checked').click()
    await vi.waitFor(() => expect(button('Continue').disabled).toBe(true))
    expect(sent).toHaveLength(0)
  })
  it('shows the destination before asking for one reference-bearing transfer', async () => {
    await ready()
    expect(host.textContent).toContain('aa'.repeat(32))
    expect(host.textContent).toContain('Burn address')
    expect(host.textContent).toContain('cannot be refunded')
    expect(sent).toHaveLength(0)
    button('Burn in wallet').click()
    await vi.waitFor(() => expect(sent).toHaveLength(1))
    expect(sent[0]).toMatchObject({ from: sender, to: info.tokenAddress, value: '0x0', chainId: '0x7a69' })
    expect(sent[0].data).toMatch(/58454331(11){32}$/)
    expect(JSON.parse(localStorage.getItem(ethereumClaimStorageKey()))).toMatchObject({ ref: pending.ref, hash: `0x${'ab'.repeat(32)}` })
    expect(JSON.parse(localStorage.getItem(ethereumClaimStorageKey())).xeAddress).toBe('aa'.repeat(32))
  })
  it.each(['accountsChanged', 'chainChanged'])('requires reconnection after %s changes the selected wallet', async event => {
    await ready()
    const handler = window.ethereum.on.mock.calls.find(([name]) => name === event)[1]
    handler(event === 'accountsChanged' ? [] : '0x1')
    await nextTick()
    expect(button('Connect wallet')).toBeDefined()
    expect(host.textContent).toContain('Connect again')
    expect(sent).toHaveLength(0)
  })
  it('keeps a rejected transfer retryable without losing the pending reference', async () => {
    reject = true
    await ready()
    button('Burn in wallet').click()
    await vi.waitFor(() => expect(host.textContent).toContain('rejected'))
    expect(sent).toHaveLength(0)
    expect(button('Burn in wallet').disabled).toBe(false)
    expect(JSON.parse(localStorage.getItem(ethereumClaimStorageKey())).ref).toBe(pending.ref)
  })
  it('keeps an uncertain wallet submission unresolved without offering another burn', async () => {
    let attempts = 0
    const request = window.ethereum.request
    window.ethereum.request = async args => {
      if (args.method === 'eth_sendTransaction') {
        attempts++
        throw new Error('Wallet connection lost')
      }
      return request(args)
    }
    await ready()
    button('Burn in wallet').click()
    await vi.waitFor(() => expect(host.textContent).toContain('Check your wallet and the claim status'))
    expect(button('Review transfer')).toBeUndefined()
    expect(button('Try again')).toBeUndefined()
    expect(JSON.parse(localStorage.getItem(ethereumClaimStorageKey())).ref).toBe(pending.ref)
    app.unmount(); host.remove()
    await mount()
    expect(button('Review transfer')).toBeUndefined()
    expect(button('Try again')).toBeUndefined()
    expect(attempts).toBe(1)
  })
  it('refuses a changed destination returned by the API', async () => {
    corrupt = true
    await ready()
    button('Burn in wallet').click()
    await vi.waitFor(() => expect(host.textContent).toContain('does not match'))
    expect(sent).toHaveLength(0)
  })
  it('refuses a network change between review and confirmation', async () => {
    await ready()
    chainId = '0x1'
    button('Burn in wallet').click()
    await vi.waitFor(() => expect(host.textContent).toContain('Connect again'))
    expect(sent).toHaveLength(0)
  })
  it('keeps a completed receipt after closing and reopening without another transfer', async () => {
    pending = { ...info, ethereumAddress: sender, xeAddress: 'aa'.repeat(32), amount: '1000000000000000000', ref: '11'.repeat(32) }
    localStorage.setItem(ethereumClaimStorageKey(), JSON.stringify(pending))
    stage = 'received'
    const props = await mount()
    await vi.waitFor(() => expect(host.textContent).toContain('Claim recorded'))
    expect(host.textContent).toContain('no native XE is paid')
    button('Close').click()
    await nextTick()
    expect(JSON.parse(localStorage.getItem(ethereumClaimStorageKey()))).toMatchObject({ ref: pending.ref, xeAddress: 'aa'.repeat(32) })
    props.visible = true
    await vi.waitFor(() => expect(host.textContent).toContain('Claim recorded'))
    expect(sent).toHaveLength(0)
  })
  it('copies the receipt and requires saving it before replacing it', async () => {
    pending = { ...info, ethereumAddress: sender, xeAddress: 'aa'.repeat(32), amount: '1000000000000000000',
      ref: '11'.repeat(32), hash: `0x${'ab'.repeat(32)}` }
    localStorage.setItem(ethereumClaimStorageKey(), JSON.stringify(pending))
    stage = 'received'
    const writeText = vi.fn().mockResolvedValue()
    vi.stubGlobal('navigator', { clipboard: { writeText } })
    await mount()
    await vi.waitFor(() => expect(host.textContent).toContain('Claim recorded'))
    button('Copy receipt').click()
    await vi.waitFor(() => expect(host.textContent).toContain('Receipt copied'))
    const receipt = writeText.mock.calls[0][0]
    for (const value of [pending.ref, pending.hash, pending.xeAddress, sender, info.chainName, '1.0 EDGE', 'XE approval and delivery']) {
      expect(receipt).toContain(value)
    }
    expect(button('Start new claim').disabled).toBe(true)
    host.querySelector('#ethereum-receipt-saved').click()
    await nextTick()
    button('Start new claim').click()
    await nextTick()
    expect(localStorage.getItem(ethereumClaimStorageKey())).toBeNull()
    expect(button('Connect wallet')).toBeDefined()
    expect(sent).toHaveLength(0)
  })
  it('keeps the receipt available when copying is denied', async () => {
    pending = { ...info, ethereumAddress: sender, xeAddress: 'aa'.repeat(32), amount: '1000000000000000000', ref: '11'.repeat(32) }
    localStorage.setItem(ethereumClaimStorageKey(), JSON.stringify(pending))
    stage = 'received'
    vi.stubGlobal('navigator', { clipboard: { writeText: vi.fn().mockRejectedValue(new Error('Denied')) } })
    await mount()
    button('Copy receipt').click()
    await vi.waitFor(() => expect(host.textContent).toContain('Could not copy'))
    expect(host.textContent).toContain(pending.ref)
    expect(localStorage.getItem(ethereumClaimStorageKey())).not.toBeNull()
    expect(button('Start new claim').disabled).toBe(true)
  })
  it.each([undefined, `0x${'ab'.repeat(32)}`])('never offers another burn for an expired reference with uncertain submission (%s)', async hash => {
    pending = { ...info, ethereumAddress: sender, xeAddress: 'aa'.repeat(32), amount: '1000000000000000000', ref: '11'.repeat(32), hash }
    localStorage.setItem(ethereumClaimStorageKey(), JSON.stringify(pending))
    stage = 'expired'
    await mount()
    await vi.waitFor(() => expect(host.textContent).toContain('reference has expired'))
    expect(button('Try again')).toBeUndefined()
    expect(button('Review transfer')).toBeUndefined()
    expect(localStorage.getItem(ethereumClaimStorageKey())).not.toBeNull()
    expect(sent).toHaveLength(0)
  })
  it('restores an unpaid claim for review and retains its original reference', async () => {
    pending = { ...info, ethereumAddress: sender, xeAddress: 'aa'.repeat(32), amount: '1000000000000000000', ref: '11'.repeat(32),
      status: 'awaiting_transfer', rejected: true }
    localStorage.setItem(ethereumClaimStorageKey(), JSON.stringify(pending))
    await mount()
    await vi.waitFor(() => expect(button('Review transfer')).toBeDefined())
    button('Review transfer').click()
    await vi.waitFor(() => expect(host.querySelector('#ethereum-claim-amount')?.value).toBe('1.0'))
    expect(host.querySelector('#ethereum-claim-xe-address').value).toBe('aa'.repeat(32))
    expect(button('Continue').disabled).toBe(true)
    expect(sent).toHaveLength(0)
    host.querySelector('#ethereum-claim-checked').click()
    await vi.waitFor(() => expect(button('Continue').disabled).toBe(false))
    button('Continue').click()
    await nextTick()
    button('Burn in wallet').click()
    await vi.waitFor(() => expect(sent).toHaveLength(1))
    expect(sent[0].data).toMatch(/58454331(11){32}$/)
  })
  it('shows the amount actually received when a transfer needs review', async () => {
    pending = { ...info, ethereumAddress: sender, xeAddress: 'aa'.repeat(32), amount: '1000000000000000000', ref: '11'.repeat(32),
      review: ['amount_mismatch'], transfer: { hash: `0x${'ab'.repeat(32)}`, amount: '2000000000000000000' } }
    localStorage.setItem(ethereumClaimStorageKey(), JSON.stringify(pending))
    stage = 'received'
    await mount()
    await vi.waitFor(() => expect(host.textContent).toContain('Claim recorded'))
    expect(host.textContent).toContain('2.0')
    expect(host.textContent).toContain('needs review')
    expect(sent).toHaveLength(0)
  })
  it('keeps an earlier collection-wallet receipt readable without calling it a burn', async () => {
    pending = { ...info, claimsAddress: '0x' + '22'.repeat(20), ethereumAddress: sender, xeAddress: 'aa'.repeat(32),
      amount: '1000000000000000000', ref: '11'.repeat(32), status: 'received' }
    localStorage.setItem(ethereumClaimStorageKey(), JSON.stringify(pending))
    await mount()
    await vi.waitFor(() => expect(host.textContent).toContain('previous transfer destination'))
    expect(host.textContent).not.toContain('burn is confirmed')
    expect(host.textContent).toContain(pending.ref)
    expect(button('Start new claim')).toBeUndefined()
    expect(sent).toHaveLength(0)
  })
  it.each([
    ['0x7a69', 1, '0xa', false], ['0x7a69', 2, '0xa', true],
    ['0x1', 2, '0x9', false], ['0x1', 2, '0xa', true]
  ])('gates reverted-burn retry on depth and finality (%s, %s, %s)', async (network, confirmations, finalized, retry) => {
    chainId = network
    const settings = { ...info, chainId, rehearsal: chainId === '0x7a69' }
    pending = { ...settings, ethereumAddress: sender, xeAddress: 'aa'.repeat(32),
      amount: '1000000000000000000', ref: '11'.repeat(32), hash: `0x${'ab'.repeat(32)}` }
    localStorage.setItem(ethereumClaimStorageKey(), JSON.stringify(pending))
    const originalFetch = window.fetch
    vi.stubGlobal('fetch', async (url, options) => url.endsWith('/info') ? { ok: true, json: async () => settings } : originalFetch(url, options))
    const request = window.ethereum.request
    window.ethereum.request = async args => {
      if (args.method === 'eth_getTransactionReceipt') return { status: '0x0', blockNumber: '0xa', blockHash: '0xblock' }
      if (args.method === 'eth_getTransactionByHash') return { from: sender, to: info.tokenAddress, input: encodeClaimTransfer(pending) }
      if (args.method === 'eth_getBlockByNumber') return args.params[0] === 'finalized' ? { number: finalized } : { number: '0xa', hash: '0xblock' }
      if (args.method === 'eth_blockNumber') return ethers.utils.hexValue(9 + confirmations)
      return request(args)
    }
    await mount(retry ? 'Transfer failed' : 'Confirming transfer')
    expect(!!button('Try again')).toBe(retry)
    expect(sent).toHaveLength(0)
  })
  it('does not overwrite a recovered receipt with a wallet response from the closed modal', async () => {
    pending = { ...info, ethereumAddress: sender, xeAddress: 'aa'.repeat(32),
      amount: '1000000000000000000',
      ref: '11'.repeat(32), hash: `0x${'ab'.repeat(32)}` }
    localStorage.setItem(ethereumClaimStorageKey(), JSON.stringify(pending))
    let resolveReceipt
    let waiting = false
    const request = window.ethereum.request
    window.ethereum.request = async args => {
      if (args.method === 'eth_getTransactionReceipt') {
        waiting = true
        return new Promise(resolve => {
          resolveReceipt = resolve
        })
      }
      if (args.method === 'eth_getTransactionByHash') return { from: sender, to: info.tokenAddress, input: encodeClaimTransfer(pending) }
      return request(args)
    }
    const props = await mount()
    await vi.waitFor(() => expect(waiting).toBe(true))
    button('Close').click()
    await nextTick()
    stage = 'received'
    props.visible = true
    await vi.waitFor(() => expect(host.textContent).toContain('Claim recorded'))
    resolveReceipt({ status: '0x0' })
    await new Promise(resolve => setTimeout(resolve, 0))
    await nextTick()
    expect(host.textContent).toContain('Claim recorded')
    expect(sent).toHaveLength(0)
  })
})
