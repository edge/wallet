// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/*global Buffer*/

import crypto from 'crypto'

const algorithm = 'aes-256-ctr'

/**
 * Compare input with hashed data.
 *
 * @param {string} hash Hashed data with which to compare input data
 * @param {string} salt Hash salt
 * @param {string} input Data to hash and compare
 * @returns boolean
 */
export const compare = (hash, salt, input) => {
  const inputHash = crypto
    .pbkdf2Sync(input, salt, 1000, 64, 'sha512')
    .toString('hex')
  return hash === inputHash
}

/**
 * Generate hash salt.
 *
 * @returns string
 */
export const createSalt = () => crypto.randomBytes(16).toString('hex')

/**
 * Decrypt some encrypted data.
 *
 * @param {{ content: string, iv: string }} enc Encrypted data
 * @param {string} secret Secret key (or, passphrase) for decryption
 * @returns string
 */
export const decrypt = (enc, secret) => {
  const decipher = crypto.createDecipheriv(algorithm, secret, Buffer.from(enc.iv, 'hex'))
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(enc.content, 'hex')),
    decipher.final()
  ])
  return decrypted.toString()
}

/**
 * Encrypt data.
 *
 * @param {string} data Text data to encrypt
 * @param {string} secret Secret key (or, passphrase) for encryption
 * @returns {{ content: string, iv: string }}
 */
export const encrypt = (data, secret) => {
  const iv = crypto.randomBytes(16)
  const cipher = crypto.createCipheriv(algorithm, secret, iv)
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()])
  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  }
}

/**
 * Hash data.
 *
 * @param {string} input Data to hash
 * @param {string} salt Hash salt
 * @returns string
 */
export const hash = (input, salt) => crypto
  .pbkdf2Sync(input, salt, 1000, 64, 'sha512')
  .toString('hex')
