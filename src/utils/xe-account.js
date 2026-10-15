// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

// XE recovery phrase v2: BIP39 + SLIP-0010 ed25519, m/44'/C'/account'.
// The shared core vectors pin every step; the leaf key is the signing seed.
import { ed25519 } from '@noble/curves/ed25519.js'
import { generateMnemonic, mnemonicToSeedSync, validateMnemonic } from '@scure/bip39'
import { hmac } from '@noble/hashes/hmac.js'
import { sha256, sha512 } from '@noble/hashes/sha2.js'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { bytesToHex, concatBytes, utf8ToBytes } from '@noble/hashes/utils.js'

const ACCOUNT_DOMAIN = utf8ToBytes('xe/account/v1')
// Provisional until XE registers a SLIP-0044 coin type.
export const RECOVERY_PHRASE_COIN_TYPE = 1
const englishWords = new Set(wordlist)

export class PhraseError extends Error {
  constructor(code, message, position) {
    super(message)
    this.name = 'PhraseError'
    this.code = code
    this.position = position
  }
}

export const normalizePhrase = phrase => phrase.toLowerCase().split(/\p{White_Space}+/u).filter(Boolean).join(' ').normalize('NFKD')

export function validatePhrase(phrase) {
  const normalized = normalizePhrase(phrase)
  const words = normalized ? normalized.split(' ') : []
  if (![12, 15, 18, 21, 24].includes(words.length)) {
    throw new PhraseError('word_count', 'recovery phrase must have 12, 15, 18, 21 or 24 words')
  }
  const unknown = words.findIndex(word => !englishWords.has(word))
  if (unknown !== -1) {
    throw new PhraseError('unknown_word', `unknown recovery phrase word at position ${unknown + 1}`, unknown + 1)
  }
  if (!validateMnemonic(normalized, wordlist)) {
    throw new PhraseError('checksum', 'recovery phrase checksum does not match')
  }
  return normalized
}

function validateAccount(account) {
  if (!Number.isInteger(account) || account < 0 || account >= 0x80000000) {
    throw new PhraseError('account', 'recovery phrase account must be between 0 and 2147483647')
  }
}

export function slip10Ed25519(seed, path) {
  let node = hmac(sha512, utf8ToBytes('ed25519 seed'), seed)
  for (const index of path) {
    validateAccount(index)
    const data = new Uint8Array(37)
    data.set(node.subarray(0, 32), 1)
    new DataView(data.buffer).setUint32(33, index + 0x80000000, false)
    node = hmac(sha512, node.subarray(32), data)
  }
  return { key: node.slice(0, 32), chainCode: node.slice(32) }
}

export const publicKeyFromSeed = seed => ed25519.getPublicKey(seed)
export const addressFromPublicKey = publicKey => bytesToHex(sha256(concatBytes(ACCOUNT_DOMAIN, publicKey)))

export function xeAccountFromPhrase(phrase, { passphrase = '', account = 0 } = {}) {
  validateAccount(account)
  phrase = validatePhrase(phrase)
  const seed = slip10Ed25519(mnemonicToSeedSync(phrase, passphrase), [44, RECOVERY_PHRASE_COIN_TYPE, account]).key
  return {
    phrase,
    words: phrase.split(' '),
    account,
    seed,
    address: addressFromPublicKey(publicKeyFromSeed(seed))
  }
}

// New address always means a new 24-word phrase at account 0.
export function newXeAccount({ passphrase = '' } = {}) {
  return xeAccountFromPhrase(generateMnemonic(wordlist, 256), { passphrase })
}

// Distinct word positions (0-based, in order) to ask back after the user has
// written the phrase down.
export function pickCheckPositions(count, total) {
  const positions = new Set()
  while (positions.size < count) positions.add(Math.floor(Math.random() * total))
  return [...positions].sort((a, b) => a - b)
}
