// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import * as storage from '../utils/storage'
import * as xe from '@edge/xe-utils'
import Connect from './Connect.vue'
import Store from '../store'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createApp, nextTick } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { saveSite, walletNetwork } from '../utils/edge-connect'

vi.mock('@edge/xe-utils', async original => {
  const real = await original()
  return {
    ...real,
    wallet: { ...real.wallet, infoWithNextNonce: vi.fn() },
    tx: { ...real.tx, createTransactions: vi.fn() }
  }
})

const PASSWORD = 'local-test-password'
const KEY = '1'.padStart(64, '0')
const PUBLIC_KEY = xe.wallet.publicKeyFromPrivateKey(KEY)
const ADDRESS = xe.wallet.deriveAddress(PUBLIC_KEY)
const SITE = 'https://burn.edge.network'
const TO = 'xe_0000000000000000000000000000000000000000'
const burn = (from, amount = 1) => ({ from, recipient: TO, amount, data: { memo: 'Claim XE', ref: 'a'.repeat(64) } })
let app
let host
let opener
let replies
let submitted

async function until(check) {
  const end = Date.now() + 10000
  while (!check()) {
    if (Date.now() > end) throw new Error('Expected connector state did not appear')
    await nextTick()
    await new Promise(resolve => setTimeout(resolve, 5))
  }
}
const button = text => [...host.querySelectorAll('button')].find(b => b.textContent.trim() === text)
async function press(text) {
  await until(() => button(text) && !button(text).disabled)
  button(text).click()
}
async function confirmBurn() {
  const confirm = host.querySelector('input[type=checkbox]')
  confirm.checked = true
  confirm.dispatchEvent(new Event('change', { bubbles: true }))
  await nextTick()
}
async function fill(value) {
  const input = host.querySelector('input[type=password]')
  input.value = value
  input.dispatchEvent(new Event('input', { bubbles: true }))
  await nextTick()
}
async function mount(withOpener = true) {
  replies = []
  opener = withOpener ? { postMessage: message => replies.push(message) } : null
  Object.defineProperty(window, 'opener', { value: opener, configurable: true })
  window.close = vi.fn()
  host = document.createElement('div')
  document.body.append(host)
  const router = createRouter({ history: createMemoryHistory(), routes: [{ path: '/', component: { render: () => null } }] })
  app = createApp(Connect).use(await Store.init()).use(router)
  app.mount(host)
  await router.isReady()
  await nextTick()
}
function request(method, params) {
  const event = new MessageEvent('message', { origin: SITE, data: { type: 'edge-connect', v: 1, id: 'q1', method, params } })
  Object.defineProperty(event, 'source', { value: opener })
  window.dispatchEvent(event)
}
const answer = () => replies.find(r => r.id === 'q1')

beforeEach(async () => {
  await storage.empty()
  localStorage.clear()
  await storage.setWallet({ privateKey: KEY, publicKey: PUBLIC_KEY }, PASSWORD, 2)
  submitted = null
  xe.wallet.infoWithNextNonce.mockResolvedValue({ address: ADDRESS, balance: 10000000, nonce: 7 })
  xe.tx.createTransactions.mockImplementation(async (url, txs) => {
    submitted = txs[0]
    return { metadata: { accepted: 1 }, results: [{ success: true, hash: xe.tx.hash(submitted).hash }] }
  })
})
afterEach(() => {
  app?.unmount()
  host?.remove()
})

describe('Edge Connect approval', () => {
  it('does not ask for secrets when opened directly or without a wallet', async () => {
    await mount(false)
    expect(host.textContent).toContain('Nothing is waiting here')
    expect(host.querySelector('input')).toBe(null)
    app.unmount()
    host.remove()
    await storage.empty()
    const debug = vi.spyOn(console, 'debug').mockImplementation(() => undefined)
    try {
      await mount()
      expect(debug).toHaveBeenCalledWith(expect.any(Error))
    }
    finally {
      debug.mockRestore()
    }
    request('edge_requestAccounts', { network: walletNetwork() })
    await until(() => host.textContent.includes('No wallet in this browser'))
    expect(host.querySelector('input')).toBe(null)
    expect(host.textContent).not.toMatch(/Ledger|recovery phrase|private key/)
  })

  it('unlocks, lets the user select an account and shares public account data only', async () => {
    await mount()
    request('edge_requestAccounts', { network: walletNetwork() })
    await until(() => button('Unlock'))
    await fill('wrong-password')
    await press('Unlock')
    await until(() => host.textContent.includes('Incorrect password'))
    await fill(PASSWORD)
    await press('Unlock')
    await press('Connect')
    await until(answer)
    expect(answer().result).toMatchObject({ address: ADDRESS, balance: 10000000, nonce: 7, network: walletNetwork() })
    expect(JSON.stringify(replies)).not.toContain(KEY)
    expect(JSON.stringify(replies)).not.toContain(PASSWORD)
    expect(await storage.getWalletVersion()).toBe(2)
  })

  it.each([0, 1])('uses existing version %s storage without migrating it', async version => {
    await storage.empty()
    await storage.setWallet({ privateKey: KEY, publicKey: PUBLIC_KEY }, PASSWORD, version)
    await mount()
    request('edge_requestAccounts', { network: walletNetwork() })
    await until(() => button('Unlock'))
    await fill(PASSWORD)
    await press('Unlock')
    await press('Connect')
    await until(answer)
    expect(answer().result.address).toBe(ADDRESS)
    expect(await storage.getWalletVersion()).toBe(version)
  })

  it('connects and signs with the selected account from a multi-wallet vault', async () => {
    const key = '2'.padStart(64, '0')
    const publicKey = xe.wallet.publicKeyFromPrivateKey(key)
    const address = xe.wallet.deriveAddress(publicKey)
    await storage.addWallet({ privateKey: key, publicKey, name: 'Second wallet' }, PASSWORD)
    xe.wallet.infoWithNextNonce.mockResolvedValue({ address, balance: 10000000, nonce: 3 })
    await mount()
    request('edge_requestAccounts', { network: walletNetwork() })
    await until(() => button('Unlock'))
    await fill(PASSWORD)
    await press('Unlock')
    await until(() => host.querySelectorAll('[role=radio]').length === 2)
    host.querySelectorAll('[role=radio]')[1].click()
    await press('Connect')
    await until(answer)
    expect(answer().result.address).toBe(address)
    app.unmount()
    host.remove()
    await mount()
    request('edge_sendTransaction', burn(address))
    await until(() => host.querySelector('input[type=password]'))
    await fill(PASSWORD)
    await confirmBurn()
    await press('Send')
    await until(answer)
    const recovered = xe.wallet.publicKeyFromSignedMessage(xe.tx.signable(submitted)[1], submitted.signature)
    expect(recovered).toBe(publicKey)
    expect(submitted.sender).toBe(address)
  })

  it('requires burn confirmation and signs the requested data with a fresh nonce', async () => {
    saveSite(SITE, ADDRESS, walletNetwork())
    await mount()
    const data = { memo: 'Claim XE', ref: 'a'.repeat(64) }
    request('edge_sendTransaction', { from: ADDRESS, recipient: TO, amount: 5000000, data })
    await until(() => host.querySelector('input[type=password]'))
    expect(host.textContent).toContain(SITE)
    expect(host.textContent).toContain('destroyed')
    await fill(PASSWORD)
    expect(button('Send').disabled).toBe(true)
    await confirmBurn()
    await press('Send')
    await until(answer)
    expect(submitted).toMatchObject({ sender: ADDRESS, recipient: TO, amount: 5000000, data, nonce: 7 })
    const recovered = xe.wallet.publicKeyFromSignedMessage(xe.tx.signable(submitted)[1], submitted.signature)
    expect(recovered).toBe(PUBLIC_KEY)
    expect(answer().result.hash).toBe(xe.tx.hash(submitted).hash)
  })

  it('does not sign for an unconnected site', async () => {
    await mount()
    request('edge_sendTransaction', burn(ADDRESS))
    await until(answer)
    expect(answer().error.code).toBe(4100)
    expect(submitted).toBe(null)
  })

  it('refuses a transfer that is not a burn claim without asking for the password', async () => {
    saveSite(SITE, ADDRESS, walletNetwork())
    await mount()
    request('edge_sendTransaction', { ...burn(ADDRESS), recipient: ADDRESS })
    await until(answer)
    expect(answer().error.code).toBe(-32602)
    expect(host.querySelector('input[type=password]')).toBe(null)
    expect(submitted).toBe(null)
  })

  it('marks a malformed submission response as uncertain', async () => {
    saveSite(SITE, ADDRESS, walletNetwork())
    xe.tx.createTransactions.mockImplementation(async (url, txs) => {
      submitted = txs[0]
      return null
    })
    await mount()
    request('edge_sendTransaction', burn(ADDRESS))
    await until(() => host.querySelector('input[type=password]'))
    await fill(PASSWORD)
    await confirmBurn()
    await press('Send')
    await until(answer)
    expect(answer().error).toMatchObject({ uncertain: true, hash: xe.tx.hash(submitted).hash })
  })

  it('does not submit after the window closes while the fresh balance is loading', async () => {
    saveSite(SITE, ADDRESS, walletNetwork())
    let finishInfo
    xe.wallet.infoWithNextNonce.mockImplementation(() => new Promise(resolve => {
      finishInfo = resolve
    }))
    await mount()
    request('edge_sendTransaction', burn(ADDRESS))
    await until(() => host.querySelector('input[type=password]'))
    await fill(PASSWORD)
    await confirmBurn()
    await press('Send')
    await until(() => finishInfo)
    window.dispatchEvent(new Event('pagehide'))
    expect(answer().error.code).toBe(4001)
    finishInfo({ address: ADDRESS, balance: 10000000, nonce: 7 })
    await until(() => host.querySelector('input[type=password]').value === '')
    expect(submitted).toBe(null)
  })

  it('reports submission transport failure as uncertain, including the locally computed hash', async () => {
    saveSite(SITE, ADDRESS, walletNetwork())
    xe.tx.createTransactions.mockImplementation(async (url, txs) => {
      submitted = txs[0]
      throw new Error('connection lost')
    })
    await mount()
    request('edge_sendTransaction', burn(ADDRESS))
    await until(() => host.querySelector('input[type=password]'))
    await fill(PASSWORD)
    await confirmBurn()
    await press('Send')
    await until(answer)
    expect(answer().error).toMatchObject({ code: -32603, uncertain: true, hash: xe.tx.hash(submitted).hash })
    expect(host.textContent).toContain('before trying again')
    expect(host.querySelector('input[type=password]')).toBe(null)
  })
})
