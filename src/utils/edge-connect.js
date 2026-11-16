// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { utils } from 'ethers'

// Edge Connect v1 bounds from Jakub's wallet handoff.
const MAX_REQUEST_ID_LENGTH = 200
const MAX_DATA_LENGTH = 64
const METHODS = ['edge_requestAccounts', 'edge_sendTransaction']
const LOOPBACK = ['localhost', '127.0.0.1', '[::1]']
export const ERRORS = {
  declined: 4001, notConnected: 4100, unknownMethod: 4200, wrongNetwork: 4900, badParams: -32602, internal: -32603
}

export const BURN_ADDRESS = 'xe_0000000000000000000000000000000000000000'
export const walletNetwork = () => import.meta.env.VITE_IS_TESTNET === 'true' ? 'testnet' : 'mainnet'
const sitesKey = network => `${network}:edge-connect:sites`
const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value) &&
  [Object.prototype, null].includes(Object.getPrototypeOf(value))

export class ConnectError extends Error {
  constructor(code, message) {
    super(message)
    this.name = 'ConnectError'
    this.code = code
  }
}

const invalid = message => new ConnectError(ERRORS.badParams, message)

/** HTTPS sites and HTTP loopback origins, as reported by the browser. */
export function siteHost(origin) {
  try {
    const url = new URL(origin)
    if (url.origin !== origin) return null
    if (url.protocol !== 'https:' && !(url.protocol === 'http:' && LOOPBACK.includes(url.hostname))) return null
    return url.host
  }
  catch {
    return null
  }
}

function onlyKeys(value, allowed) {
  for (const key of Object.keys(value)) if (!allowed.includes(key)) throw invalid(`Unexpected field: ${key.slice(0, 32)}`)
}

function checkAddress(value) {
  // Edge uses EIP-55's letter case; another spelling is another account on its chain.
  if (typeof value !== 'string' || !/^xe_[0-9a-fA-F]{40}$/.test(value) ||
    value !== `xe_${utils.getAddress(`0x${value.slice(3).toLowerCase()}`).slice(2)}`) {
    throw invalid('An address is not in its canonical checksummed form.')
  }
}

/** The only transaction data a site may request is a transfer's memo and reference. */
export function validateRequest(method, params, network) {
  if (!METHODS.includes(method)) throw new ConnectError(ERRORS.unknownMethod, `Unknown method: ${String(method).slice(0, 64)}`)
  if (!isObject(params)) throw invalid('params must be an object')
  if (params.network !== undefined || method === 'edge_requestAccounts') {
    if (!['mainnet', 'testnet'].includes(params.network)) throw invalid('params.network must be mainnet or testnet')
    if (params.network !== network) throw new ConnectError(ERRORS.wrongNetwork, `The wallet is on ${network}, not ${params.network}`)
  }
  if (method === 'edge_requestAccounts') {
    onlyKeys(params, ['network'])
    return { network: params.network }
  }
  onlyKeys(params, ['from', 'recipient', 'amount', 'data', 'network'])
  checkAddress(params.from)
  checkAddress(params.recipient)
  if (!Number.isSafeInteger(params.amount) || params.amount < 1) throw invalid('params.amount must be a whole number of micro-EDGE, at least 1')
  const data = {}
  if (params.data !== undefined) {
    if (!isObject(params.data)) throw invalid('params.data must be an object')
    onlyKeys(params.data, ['memo', 'ref'])
    for (const key of ['memo', 'ref']) {
      const value = params.data[key]
      if (value === undefined) continue
      if (typeof value !== 'string') throw invalid(`params.data.${key} must be a string`)
      if (value.length > MAX_DATA_LENGTH) throw invalid(`params.data.${key} is longer than ${MAX_DATA_LENGTH} characters`)
      data[key] = value
    }
  }
  return { from: params.from, recipient: params.recipient, amount: params.amount, data }
}

export function checkBalance(amount, balance) {
  if (!Number.isSafeInteger(balance) || balance < 0) throw new Error('The blockchain returned an invalid balance.')
  if (amount > balance) throw invalid('The amount is more than the available balance.')
}

function loadSites(network, storage) {
  const raw = storage.getItem(sitesKey(network))
  if (raw === null) return {}
  const sites = JSON.parse(raw)
  if (!isObject(sites)) throw new Error('Saved site permissions are invalid. Clear this wallet site\'s permissions and connect again.')
  return sites
}

export function saveSite(origin, address, network, storage = window.localStorage) {
  if (!siteHost(origin)) throw invalid('Invalid site origin')
  checkAddress(address)
  const sites = loadSites(network, storage)
  sites[origin] = address
  storage.setItem(sitesKey(network), JSON.stringify(sites))
}

export function preflight(request, network = walletNetwork(), storage = window.localStorage) {
  const params = validateRequest(request.method, request.params, network)
  if (params.from && loadSites(network, storage)[request.origin] !== params.from) {
    throw new ConnectError(ERRORS.notConnected, 'This site is not connected to this account. Connect again.')
  }
  return params
}

/** Quoted text with controls and non-ASCII characters visible as UTF-16 escapes. */
export const exactText = text => JSON.stringify(text).replace(/[\u007f-\uffff]/g, c => `\\u${c.charCodeAt(0).toString(16).padStart(4, '0')}`)

/** One popup request, bound to its opener and the browser-reported origin. */
export function startSession(win, { onRequest, onBadOrigin } = {}) {
  if (!win.opener) return null
  let request = null
  let answered = false
  let submittedHash = null
  const finish = (body, keepOpen = false) => {
    if (answered || !request) return false
    answered = true
    if (win.opener && !win.opener.closed) {
      win.opener.postMessage({ type: 'edge-connect', v: 1, id: request.id, ...body }, request.origin)
    }
    if (!keepOpen) win.close()
    return true
  }
  const session = {
    get answered() {
      return answered
    },
    get openerGone() {
      return !win.opener || !!win.opener.closed
    },
    respond: result => finish({ result }),
    fail: (code, message, extra = {}) => finish({ error: { code, message, ...extra } }, true),
    submitting: hash => {
      submittedHash = hash
    },
    stop() {
      win.removeEventListener('message', onMessage)
      win.removeEventListener('pagehide', onPageHide)
    }
  }
  function onMessage(event) {
    if (request || event.source !== win.opener) return
    const data = event.data
    if (!isObject(data) || data.type !== 'edge-connect' || data.v !== 1 || data.event !== undefined) return
    if (!siteHost(event.origin)) {
      answered = true
      win.removeEventListener('message', onMessage)
      if (onBadOrigin) onBadOrigin()
      return
    }
    request = { id: data.id, method: data.method, params: data.params, origin: event.origin }
    if (typeof data.id !== 'string' || !data.id || data.id.length > MAX_REQUEST_ID_LENGTH) {
      request.id = null
      session.fail(ERRORS.badParams, `id must be a non-empty string of at most ${MAX_REQUEST_ID_LENGTH} characters`)
      return
    }
    onRequest(request)
  }
  function onPageHide() {
    if (!request || answered) return
    if (submittedHash) session.fail(ERRORS.internal, 'The window closed during submission. Check the transaction before trying again.', {
      uncertain: true, hash: submittedHash
    })
    else session.fail(ERRORS.declined, 'The window was closed before submission.')
  }
  win.addEventListener('message', onMessage)
  win.addEventListener('pagehide', onPageHide)
  win.opener.postMessage({ type: 'edge-connect', v: 1, event: 'ready' }, '*')
  return session
}
