// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import {
  claimFailed, claimProgress, clearActiveClaim, keepLastWordsTogether, loadActiveClaim, loadFailedRefs,
  markClaimFailed, newXeAddressRegexp, normaliseXeAddress, saveActiveClaim
} from './claim'
import { describe, expect, it } from 'vitest'

const base = { chainTx: null, pending: false, walletNonce: 4, txNonce: 4, claim: null, required: 10 }

describe('claimProgress', () => {
  it('is posted while the transfer is pending', () => {
    expect(claimProgress({ ...base, pending: true }).stage).toBe('posted')
  })

  it('counts confirmations once the transfer is in a block', () => {
    const at0 = claimProgress({ ...base, chainTx: { confirmations: 0 } })
    const at5 = claimProgress({ ...base, chainTx: { confirmations: 5 } })
    expect(at0).toMatchObject({ stage: 'in_block', confirmations: 0 })
    expect(at5).toMatchObject({ stage: 'in_block', confirmations: 5 })
    expect(at5.percent).toBeGreaterThan(at0.percent)
  })

  it('is confirmed at the required confirmations', () => {
    expect(claimProgress({ ...base, chainTx: { confirmations: 10 } }).stage).toBe('confirmed')
    expect(claimProgress({ ...base, chainTx: { confirmations: 25 } }).stage).toBe('confirmed')
  })

  it('is received once the claims service has it, whatever the chain says', () => {
    const received = claimProgress({ ...base, claim: { status: 'received' } })
    expect(received).toMatchObject({ stage: 'received', percent: 100 })
  })

  it('is missing when the transfer is nowhere and its nonce is unused', () => {
    expect(claimProgress(base).stage).toBe('missing')
  })

  it('is not missing when the nonce is used: the transfer is on its way into a block', () => {
    expect(claimProgress({ ...base, walletNonce: 5 }).stage).toBe('posted')
  })

  it('fails when the claims service reports the claim expired', () => {
    expect(claimProgress({ ...base, claim: { status: 'expired' } }).stage).toBe('failed')
  })

  it('trusts the chain over an expired claim', () => {
    const progress = claimProgress({ ...base, chainTx: { confirmations: 2 }, claim: { status: 'expired' } })
    expect(progress.stage).toBe('in_block')
  })

  it('keeps the percentage in order through the stages', () => {
    const percents = [
      claimProgress({ ...base, pending: true }),
      claimProgress({ ...base, chainTx: { confirmations: 0 } }),
      claimProgress({ ...base, chainTx: { confirmations: 9 } }),
      claimProgress({ ...base, chainTx: { confirmations: 10 } }),
      claimProgress({ ...base, claim: { status: 'received' } })
    ].map(p => p.percent)
    expect([...percents].sort((a, b) => a - b)).toEqual(percents)
  })
})

describe('new XE addresses', () => {
  it('accepts 64 hex after trimming and lowercasing', () => {
    expect(newXeAddressRegexp.test(normaliseXeAddress(`  ${'AB'.repeat(32)} `))).toBe(true)
  })

  it('rejects Edge addresses and short values', () => {
    expect(newXeAddressRegexp.test(normaliseXeAddress('xe_0cba2b664C9672860Bcbf51d7Ed022Cb9E007563'))).toBe(false)
    expect(newXeAddressRegexp.test('ab'.repeat(31))).toBe(false)
  })
})

describe('failed claims', () => {
  it('remembers failed references per address', () => {
    markClaimFailed('xe_one', 'r1')
    markClaimFailed('xe_one', 'r2')
    markClaimFailed('xe_one', 'r1')
    expect(loadFailedRefs('xe_one')).toEqual(['r1', 'r2'])
    expect(loadFailedRefs('xe_two')).toEqual([])
  })

  it('shows a claim failed when expired, or awaiting with a transfer that failed here', () => {
    expect(claimFailed({ status: 'expired', ref: 'x' }, [])).toBe(true)
    expect(claimFailed({ status: 'awaiting_transfer', ref: 'x' }, ['x'])).toBe(true)
    expect(claimFailed({ status: 'awaiting_transfer', ref: 'x' }, [])).toBe(false)
    expect(claimFailed({ status: 'received', ref: 'x' }, ['x'])).toBe(false)
  })
})

describe('active claim storage', () => {
  it('saves, loads and clears the claim in progress per address', () => {
    const claim = { ref: 'a'.repeat(64), hash: 'b'.repeat(64), nonce: 3 }
    saveActiveClaim('xe_one', claim)
    expect(loadActiveClaim('xe_one')).toEqual(claim)
    expect(loadActiveClaim('xe_two')).toBeNull()
    clearActiveClaim('xe_one')
    expect(loadActiveClaim('xe_one')).toBeNull()
  })
})

describe('keepLastWordsTogether', () => {
  it('joins the last two words with a non-breaking space', () => {
    expect(keepLastWordsTogether('too many open claims for this address')).toBe('too many open claims for this\u00a0address')
  })

  it('ignores trailing space', () => {
    expect(keepLastWordsTogether('try again later ')).toBe('try again\u00a0later')
  })

  it('leaves a single word as it is', () => {
    expect(keepLastWordsTogether('Failed')).toBe('Failed')
    expect(keepLastWordsTogether('')).toBe('')
  })
})
