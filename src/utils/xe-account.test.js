// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { entropyToMnemonic, mnemonicToSeedSync } from '@scure/bip39'
import { sha256 } from '@noble/hashes/sha2.js'
import vectors from './xe-recovery-phrase-vectors.json'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import {
  addressFromPublicKey, newXeAccount, xeAccountFromPhrase, pickCheckPositions,
  publicKeyFromSeed, validatePhrase, slip10Ed25519, PhraseError, RECOVERY_PHRASE_COIN_TYPE
} from './xe-account'
import { bytesToHex, hexToBytes, utf8ToBytes } from '@noble/hashes/utils.js'
import { describe, expect, it } from 'vitest'

// Byte-for-byte copy of core/core/testdata/recovery-phrase-vectors.json.
describe('XE recovery phrase v2', () => {
  it('pins the shared vectors and wordlist', () => {
    expect(vectors.version).toBe(2)
    expect(vectors.coin_type).toBe(RECOVERY_PHRASE_COIN_TYPE)
    expect(vectors.coin_type_provisional).toBe(true)
    expect(vectors.bip39).toHaveLength(24)
    expect(vectors.slip10_ed25519).toHaveLength(12)
    expect(vectors.xe).toHaveLength(10)
    expect(vectors.invalid).toHaveLength(4)
    expect(bytesToHex(sha256(utf8ToBytes(`${wordlist.join('\n')}\n`)))).toBe(vectors.wordlist_sha256)
  })
  it.each(vectors.bip39)('official BIP39 entropy $entropy', v => {
    expect(entropyToMnemonic(hexToBytes(v.entropy), wordlist)).toBe(v.mnemonic)
    expect(validatePhrase(v.mnemonic)).toBe(v.mnemonic)
    expect(bytesToHex(mnemonicToSeedSync(v.mnemonic, v.passphrase))).toBe(v.seed)
  })
  it.each(vectors.slip10_ed25519)('official SLIP-0010 $path', v => {
    const node = slip10Ed25519(hexToBytes(v.seed), v.path.split('/').slice(1).map(part => Number(part.slice(0, -1))))
    expect(bytesToHex(node.key)).toBe(v.private_key)
    expect(bytesToHex(node.chainCode)).toBe(v.chain_code)
    expect('00' + bytesToHex(publicKeyFromSeed(node.key))).toBe(v.public_key)
  })
  it.each(vectors.xe)('XE account $account at $address', v => {
    const wallet = xeAccountFromPhrase(v.phrase, v)
    expect(bytesToHex(wallet.seed)).toBe(v.ed25519_seed)
    expect(bytesToHex(publicKeyFromSeed(wallet.seed))).toBe(v.public_key)
    expect(wallet.address).toBe(v.address)
  })
  it.each(vectors.invalid)('typed $error error', v => {
    expect(() => validatePhrase(v.phrase)).toThrow(PhraseError)
    try { validatePhrase(v.phrase) } catch (error) {
      expect(error.code).toBe(v.error)
      if (v.position) expect(error.position).toBe(v.position)
      expect(String(error)).not.toContain('notaword')
    }
  })
  it.each([-1, 0.5, 2147483648, NaN, Infinity])('rejects account %s', account => {
    expect(() => xeAccountFromPhrase(vectors.xe[0].phrase, { account })).toThrow(PhraseError)
  })
  it('normalizes Unicode whitespace and NFKD passphrases', () => {
    const phrase = vectors.xe[0].phrase
    expect(xeAccountFromPhrase('\u0085' + phrase.toUpperCase().replaceAll(' ', '\u2003\t')).address).toBe(vectors.xe[0].address)
    expect(xeAccountFromPhrase(phrase, { passphrase: 'café' }).address).toBe(xeAccountFromPhrase(phrase, { passphrase: 'cafe\u0301' }).address)
    expect(xeAccountFromPhrase(phrase, { passphrase: 'café ' }).address).not.toBe(xeAccountFromPhrase(phrase, { passphrase: 'café' }).address)
  })
  it('generates a new phrase for every account 0 address', () => {
    const first = newXeAccount()
    const second = newXeAccount()
    expect(first.account).toBe(0)
    expect(first.words).toHaveLength(24)
    expect(first.phrase).toBe(first.words.join(' '))
    expect(xeAccountFromPhrase(first.phrase).address).toBe(first.address)
    expect(addressFromPublicKey(publicKeyFromSeed(first.seed))).toBe(first.address)
    expect(second.phrase).not.toBe(first.phrase)
    expect(second.address).not.toBe(first.address)
  })
  it('picks three distinct ordered word positions', () => {
    for (let i = 0; i < 50; i++) {
      const positions = pickCheckPositions(3, 24)
      expect(positions).toHaveLength(3)
      expect(new Set(positions).size).toBe(3)
      expect([...positions].sort((a, b) => a - b)).toEqual(positions)
      positions.forEach(p => expect(p >= 0 && p < 24).toBe(true))
    }
  })
})
