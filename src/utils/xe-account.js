// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

// New XE address for Claim XE. XE is the new chain (xeprotocol/core), not the
// Edge chain: its addresses are 64 lowercase hex with no prefix.
//
// The XE recovery phrase (core #1005) is the 32-byte ed25519 seed written as
// 24 BIP39 English words: BIP39's entropy-to-mnemonic encoding applied to the
// seed itself. No PBKDF2, passphrase or derivation path: the words are the
// seed. The address is sha256("xe/account/v1" || ed25519 public key).
// xe-recovery-phrase-vectors.json is a copy of the core vectors.

import { ed25519 } from '@noble/curves/ed25519.js'
import { entropyToMnemonic } from '@scure/bip39'
import { sha256 } from '@noble/hashes/sha2.js'
import { wordlist } from '@scure/bip39/wordlists/english.js'
import { bytesToHex, concatBytes, randomBytes, utf8ToBytes } from '@noble/hashes/utils.js'

const ACCOUNT_DOMAIN = utf8ToBytes('xe/account/v1')

export const phraseFromSeed = seed => entropyToMnemonic(seed, wordlist)

export const publicKeyFromSeed = seed => ed25519.getPublicKey(seed)

export const addressFromPublicKey = publicKey => bytesToHex(sha256(concatBytes(ACCOUNT_DOMAIN, publicKey)))

// A new XE account from a random seed. The seed is not kept: the words are the
// only copy.
export function newXeAccount() {
  const seed = randomBytes(32)
  return {
    words: phraseFromSeed(seed).split(' '),
    address: addressFromPublicKey(publicKeyFromSeed(seed))
  }
}

// Distinct word positions (0-based, in order) to ask back after the user has
// written the phrase down.
export function pickCheckPositions(count, total) {
  const positions = new Set()
  while (positions.size < count) positions.add(Math.floor(Math.random() * total))
  return [...positions].sort((a, b) => a - b)
}
