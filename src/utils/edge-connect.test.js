// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import * as xe from '@edge/xe-utils'
import { allowedSite, checkBalance, preflight, saveSite, startSession, validateRequest } from './edge-connect'
import { beforeEach, describe, expect, it } from 'vitest'

const SITE = 'https://burn.testnet.edge.network'
const FROM = xe.wallet.deriveAddressFromPrivateKey('1'.padStart(64, '0'))
const TO = 'xe_0000000000000000000000000000000000000000'
const transfer = () => ({ from: FROM, recipient: TO, amount: 5000000, data: { memo: 'Claim XE', ref: 'a'.repeat(64) } })

beforeEach(() => localStorage.clear())

describe('Edge Connect requests', () => {
  it('accepts the burn request without altering addresses, amount, memo or reference', () => {
    expect(validateRequest('edge_sendTransaction', transfer(), 'testnet')).toEqual(transfer())
    expect(validateRequest('edge_requestAccounts', { network: 'testnet' }, 'testnet')).toEqual({ network: 'testnet' })
  })

  it('rejects other networks, methods and transaction actions', () => {
    expect(() => validateRequest('edge_requestAccounts', { network: 'mainnet' }, 'testnet')).toThrow('not mainnet')
    expect(() => validateRequest('signAnything', {}, 'testnet')).toThrow('Unknown method')
    expect(() => validateRequest('edge_sendTransaction', { ...transfer(), data: { action: 'set_var' } }, 'testnet')).toThrow('field')
  })

  it.each([0, -1, 0.1, NaN, Infinity, Number.MAX_SAFE_INTEGER + 1, '1'])('rejects the amount %s', amount => {
    expect(() => validateRequest('edge_sendTransaction', { ...transfer(), amount }, 'testnet')).toThrow('whole number')
  })

  it('sends only a burn claim: the burn address, the claim memo and a claim reference', () => {
    const send = params => () => validateRequest('edge_sendTransaction', params, 'testnet')
    expect(send({ ...transfer(), recipient: FROM })).toThrow('burn address')
    expect(send({ ...transfer(), data: undefined })).toThrow('object')
    for (const memo of [undefined, 1, 'claim xe', 'Claim XE ', 'Send']) {
      expect(send({ ...transfer(), data: { ...transfer().data, memo } })).toThrow('memo')
    }
    for (const ref of [undefined, 1, 'a'.repeat(63), 'a'.repeat(65), 'A'.repeat(64), 'g'.repeat(64)]) {
      expect(send({ ...transfer(), data: { ...transfer().data, ref } })).toThrow('ref')
    }
  })

  it('rejects noncanonical addresses, malformed params and overlong text', () => {
    expect(() => validateRequest('edge_sendTransaction', { ...transfer(), from: FROM.toLowerCase() }, 'testnet')).toThrow('checksummed')
    for (const params of [null, [], 1]) expect(() => validateRequest('edge_sendTransaction', params, 'testnet')).toThrow('object')
    expect(() => checkBalance(2, 1)).toThrow('balance')
    expect(() => checkBalance(1, 1)).not.toThrow()
  })

  it('accepts only the burn page of its own network, and loopback on testnet', () => {
    expect(allowedSite('https://burn.edge.network', 'mainnet')).toBe(true)
    expect(allowedSite(SITE, 'testnet')).toBe(true)
    for (const origin of ['http://localhost:5174', 'https://127.0.0.1:5174', 'http://[::1]:5174']) {
      expect(allowedSite(origin, 'testnet')).toBe(true)
      expect(allowedSite(origin, 'mainnet')).toBe(false)
    }
    expect(allowedSite(SITE, 'mainnet')).toBe(false)
    expect(allowedSite('https://burn.edge.network', 'testnet')).toBe(false)
    for (const origin of ['null', 'http://burn.testnet.edge.network', `${SITE}/path`, `${SITE}.attacker.test`,
      'https://claim.testnet.edge.network', 'http://localhost.attacker.test', 'file:///tmp/a']) {
      expect(allowedSite(origin, 'testnet')).toBe(false)
    }
  })

  it('refuses to save a permission for another site', () => {
    expect(() => saveSite('https://attacker.test', FROM, 'testnet')).toThrow('origin')
    expect(() => saveSite(SITE, FROM, 'mainnet')).toThrow('origin')
  })

  it('binds permission to the exact origin, network and address', () => {
    const request = { origin: SITE, method: 'edge_sendTransaction', params: transfer() }
    expect(() => preflight(request, 'testnet')).toThrow('connected')
    saveSite(SITE, FROM, 'testnet')
    expect(preflight(request, 'testnet')).toEqual(transfer())
    expect(() => preflight({ ...request, origin: `${SITE}.attacker.test` }, 'testnet')).toThrow('connected')
    expect(() => preflight(request, 'mainnet')).toThrow('connected')
  })

  it('reports permission storage errors rather than pretending to connect', () => {
    const storage = { getItem: () => null, setItem: () => {
      throw new Error('storage full')
    } }
    expect(() => saveSite(SITE, FROM, 'testnet', storage)).toThrow('storage full')
  })
})

function windowPair() {
  const replies = []
  const win = new EventTarget()
  win.opener = { postMessage: (message, origin) => replies.push({ message, origin }) }
  win.close = () => {
    win.closed = true
  }
  const request = (source = win.opener, origin = SITE, method = 'edge_requestAccounts') => {
    const event = new MessageEvent('message', {
      origin, data: { type: 'edge-connect', v: 1, id: 'q1', method, params: { network: 'testnet' } }
    })
    Object.defineProperty(event, 'source', { value: source })
    win.dispatchEvent(event)
  }
  return { win, replies, request }
}

describe('Edge Connect message exchange', () => {
  it('has no session without an opener', () => {
    expect(startSession({ opener: null }, {})).toBe(null)
  })

  it('ignores other windows, answers one request and uses the browser-provided origin', () => {
    const { win, replies, request } = windowPair()
    const requests = []
    const session = startSession(win, { onRequest: r => requests.push(r), network: 'testnet' })
    expect(replies).toEqual([{ message: { type: 'edge-connect', v: 1, event: 'ready' }, origin: '*' }])
    request({})
    expect(requests).toHaveLength(0)
    request()
    request()
    expect(requests).toHaveLength(1)
    expect(requests[0].origin).toBe(SITE)
    session.respond({ address: FROM })
    session.fail(4001, 'cancelled')
    expect(replies).toHaveLength(2)
    expect(replies[1]).toEqual({ message: { type: 'edge-connect', v: 1, id: 'q1', result: { address: FROM } }, origin: SITE })
    expect(win.closed).toBe(true)
    session.stop()
  })

  it('announces itself only to the mainnet burn page on mainnet', () => {
    const { win, replies } = windowPair()
    const session = startSession(win, { onRequest: () => undefined, network: 'mainnet' })
    expect(replies).toEqual([{ message: { type: 'edge-connect', v: 1, event: 'ready' }, origin: 'https://burn.edge.network' }])
    session.stop()
  })

  it.each(['http://attacker.test', 'https://attacker.test', 'http://localhost:5174'])('rejects %s on mainnet before running a request', origin => {
    const { win, request } = windowPair()
    let rejected = false
    let accepted = false
    const session = startSession(win, { onRequest: () => {
      accepted = true
    }, onBadOrigin: () => {
      rejected = true
    }, network: 'mainnet' })
    request(win.opener, origin)
    expect(rejected).toBe(true)
    expect(accepted).toBe(false)
    session.stop()
  })

  it('distinguishes closing before submission from an uncertain submission', () => {
    for (const submitted of [false, true]) {
      const { win, replies, request } = windowPair()
      const session = startSession(win, { onRequest: () => undefined, network: 'testnet' })
      request()
      if (submitted) session.submitting('b'.repeat(64))
      win.dispatchEvent(new Event('pagehide'))
      const error = replies.at(-1).message.error
      if (submitted) expect(error).toMatchObject({ code: -32603, uncertain: true, hash: 'b'.repeat(64) })
      else expect(error).toMatchObject({ code: 4001 })
      session.stop()
    }
  })
})
