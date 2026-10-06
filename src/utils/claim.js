// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

// Claim XE: client for the claims service (edge/xe-claim) and the logic that
// follows a claim transfer on the Edge chain.

const CLAIMS_API_URL = import.meta.env.VITE_CLAIMS_API_URL

export const claimsEnabled = () => !!CLAIMS_API_URL

async function request(path, options = {}) {
  const res = await fetch(`${CLAIMS_API_URL}${path}`, {
    ...options,
    headers: { 'content-type': 'application/json' }
  })
  const body = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(body.error || `Claims service error (HTTP ${res.status}).`)
  return body
}

export const fetchClaimsInfo = () => request('/info')

export const createClaim = (edgeAddress, xeAddress, amount) => request('/claims', {
  method: 'POST',
  body: JSON.stringify({ edgeAddress, xeAddress, amount })
})

export const fetchClaim = ref => request(`/claims/${ref}`)

export const fetchClaims = async address => (await request(`/claims?address=${address}`)).results

// New XE address: 64 hex, no prefix. Not an Edge address (xe_...).
export const newXeAddressRegexp = /^[0-9a-f]{64}$/

export const normaliseXeAddress = address => address.trim().toLowerCase()

// Joins the last two words with a non-breaking space, so a message that wraps
// never leaves one word alone on its last line.
export const keepLastWordsTogether = text => text.trim().replace(/\s+(\S+)$/, '\u00a0$1')

// Stages of a claim transfer, in order.
export const STAGES = ['posted', 'in_block', 'confirmed', 'received']

// Where a claim transfer is, from one round of checks:
//   chainTx       GET /transaction/:hash on the chain, or null when not found
//   pending       the hash is in the sender's pending transactions
//   walletNonce   the sender's confirmed nonce
//   txNonce       the nonce the claim transfer was signed with
//   claim         the claim from the claims service, or null
//   required      confirmations the claims service waits for
// The chain can accept a transfer and then drop it. A transfer that is
// neither pending nor in a block, while its nonce is still unused, is
// 'missing'; the caller treats repeated misses as a failed claim.
export function claimProgress({ chainTx, pending, walletNonce, txNonce, claim, required }) {
  if (claim && claim.status === 'received') return { stage: 'received', confirmations: required, percent: 100 }

  // The chain is the evidence: a transfer in a block is on its way, whatever
  // the claims service says about the claim's expiry.
  if (chainTx) {
    const confirmations = chainTx.confirmations
    if (confirmations >= required) return { stage: 'confirmed', confirmations, percent: 90 }
    return { stage: 'in_block', confirmations, percent: 30 + Math.floor(55 * confirmations / required) }
  }

  if (claim && claim.status === 'expired') return { stage: 'failed', confirmations: 0, percent: 0 }

  if (pending || walletNonce > txNonce) return { stage: 'posted', confirmations: 0, percent: 15 }
  return { stage: 'missing', confirmations: 0, percent: 15 }
}

// Misses in a row before a claim counts as failed. One miss can be a transfer
// moving from the mempool into a block between two requests.
export const MISSES_TO_FAIL = 3

// The claim in progress is kept in the browser, per Edge address, so the
// modal can follow it again after the page is closed.
const storageKey = address => `claim-xe:${address}`

export function saveActiveClaim(address, claim) {
  try {
    localStorage.setItem(storageKey(address), JSON.stringify(claim))
  }
  catch (err) {
    console.error('Could not save the claim in progress:', err)
  }
}

export function loadActiveClaim(address) {
  try {
    return JSON.parse(localStorage.getItem(storageKey(address)))
  }
  catch {
    return null
  }
}

export function clearActiveClaim(address) {
  try {
    localStorage.removeItem(storageKey(address))
  }
  catch {
    // Storage unavailable: nothing to clear.
  }
}

// References whose transfer this browser saw fail. The claims service only
// calls such a claim expired after its TTL, so the list shows it failed now.
const failedKey = address => `claim-xe-failed:${address}`

export function loadFailedRefs(address) {
  try {
    return JSON.parse(localStorage.getItem(failedKey(address))) || []
  }
  catch {
    return []
  }
}

export function markClaimFailed(address, ref) {
  try {
    const refs = loadFailedRefs(address).filter(r => r !== ref)
    localStorage.setItem(failedKey(address), JSON.stringify([ref, ...refs].slice(0, 20)))
  }
  catch (err) {
    console.error('Could not save the failed claim:', err)
  }
}

// Status for the claims list: failed when the service says expired, or when
// the transfer failed here and the service has not seen one.
export function claimFailed(claim, failedRefs) {
  return claim.status === 'expired' || (claim.status === 'awaiting_transfer' && failedRefs.includes(claim.ref))
}
