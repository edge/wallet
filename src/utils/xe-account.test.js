// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { mnemonicToEntropy } from '@scure/bip39'
import { sha256 } from '@noble/hashes/sha2.js'
import vectors from './xe-recovery-phrase-vectors.json'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import {
  addressFromPublicKey, newXeAccount, phraseFromSeed, pickCheckPositions, publicKeyFromSeed
} from './xe-account'
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js'
import { describe, expect, it } from 'vitest'

// The vectors file is a copy of xeprotocol/core core/testdata/recovery-phrase-vectors.json.
describe('XE recovery phrase vectors', () => {
  it('uses the BIP39 English wordlist that core pins', () => {
    expect(bytesToHex(sha256(utf8ToBytes(`${wordlist.join('\n')}\n`)))).toBe(vectors.wordlist_sha256)
  })

  it('encodes each BIP39 32-byte entropy vector', () => {
    for (const v of vectors.bip39) {
      expect(phraseFromSeed(hexToBytes(v.entropy))).toBe(v.mnemonic)
    }
  })

  it('derives the phrase, public key and address of each XE vector', () => {
    for (const v of vectors.xe) {
      const seed = hexToBytes(v.seed)
      const publicKey = publicKeyFromSeed(seed)
      expect(phraseFromSeed(seed)).toBe(v.phrase)
      expect(bytesToHex(publicKey)).toBe(v.public_key)
      expect(addressFromPublicKey(publicKey)).toBe(v.address)
    }
  })
})

describe('newXeAccount', () => {
  it('returns 24 words whose seed derives the returned address', () => {
    const { address, words } = newXeAccount()
    expect(words).toHaveLength(24)
    expect(address).toMatch(/^[0-9a-f]{64}$/)
    const seed = mnemonicToEntropy(words.join(' '), wordlist)
    expect(addressFromPublicKey(publicKeyFromSeed(seed))).toBe(address)
  })

  it('returns a new account each time', () => {
    expect(newXeAccount().address).not.toBe(newXeAccount().address)
  })
})

describe('pickCheckPositions', () => {
  it('picks distinct positions in order, inside the phrase', () => {
    for (let i = 0; i < 50; i++) {
      const positions = pickCheckPositions(3, 24)
      expect(positions).toHaveLength(3)
      expect(new Set(positions).size).toBe(3)
      expect([...positions].sort((a, b) => a - b)).toEqual(positions)
      positions.forEach(p => expect(p >= 0 && p < 24).toBe(true))
    }
  })
})
