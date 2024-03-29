// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import CryptoJS from 'crypto-js'

const hasher = CryptoJS.algo.SHA512.create()
const iterations = 1000
const keySize = 16

/**
 * Compare input with hashed data.
 *
 * @param {string} hash Hashed data with which to compare input data
 * @param {string} salt Hash salt
 * @param {string} input Data to hash and compare
 * @returns boolean
 */
export const compare = (hash, salt, input) => {
  const key = CryptoJS.PBKDF2(input, salt, { keySize, hasher, iterations })
  return CryptoJS.enc.Hex.stringify(key) === hash
}

/**
 * Generate hash salt.
 *
 * @returns string
 */
export const createSalt = () => CryptoJS.enc.Hex.stringify(CryptoJS.lib.WordArray.random(16))

/**
 * Decrypt some encrypted data.
 *
 * @param {{ content: string, iv: string, salt: string | undefined }} enc Encrypted data
 * @param {string} secret Secret key (or, passphrase) for decryption
 * @returns Promise<string>
 */
export const decrypt = async (enc, secret) => {
  if (!enc.salt) return decryptClassic(enc, secret)
  const ciphertext = CryptoJS.enc.Hex.parse(enc.content)
  const iv = CryptoJS.enc.Hex.parse(enc.iv)
  const salt = CryptoJS.enc.Hex.parse(enc.salt)
  const dec = CryptoJS.AES.decrypt({ ciphertext, iv, salt }, secret)
  const res = CryptoJS.enc.Utf8.stringify(dec)
  return res
}

/**
 * Decrypt some encrypted data.
 * This method provides backward compatibility for encrypted data that does not include a salt.
 *
 * With thanks to [@g45t345rt](https://github.com/g45t345rt); see https://github.com/edge/wallet/issues/256#issuecomment-1582186310
 *
 * @param {{ content: string, iv: string }} enc Encrypted data
 * @param {string} secret Secret key (or, passphrase) for decryption
 * @returns Promise<string>
 */
const decryptClassic = async (enc, secret) => {
  // based on https://stackoverflow.com/a/73476151
  const hex2buf = str => new Uint8Array(str.match(/[\da-f]{2}/g).map(h => parseInt(h, 16)))

  const useSecret = (new TextEncoder()).encode(secret)
  const useIV = hex2buf(enc.iv)
  const useContent = hex2buf(enc.content)
  const key = await crypto.subtle.importKey(
    'raw',
    useSecret,
    { name: 'AES-CTR', length: 256 },
    false,
    ['decrypt']
  )
  const data = await crypto.subtle.decrypt(
    { name: 'AES-CTR', counter: useIV.buffer, length: useIV.length },
    key,
    useContent
  )

  const res = (new TextDecoder('utf-8')).decode(data)
  return res
}

/**
 * Encrypt data.
 *
 * @param {string} data Text data to encrypt
 * @param {string} secret Secret key (or, passphrase) for encryption
 * @returns {{ content: string, iv: string, salt: string }}
 */
export const encrypt = (data, secret) => {
  const encrypted = CryptoJS.AES.encrypt(data, secret)
  return {
    content: CryptoJS.enc.Hex.stringify(encrypted.ciphertext),
    iv: CryptoJS.enc.Hex.stringify(encrypted.iv),
    salt: CryptoJS.enc.Hex.stringify(encrypted.salt)
  }
}

/**
 * Hash data.
 *
 * @param {string} input Data to hash
 * @param {string} salt Hash salt
 * @returns string
 */
export const hash = (input, salt) => {
  const key = CryptoJS.PBKDF2(input, salt, { keySize, hasher, iterations })
  return CryptoJS.enc.Hex.stringify(key)
}
