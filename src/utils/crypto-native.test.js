// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { describe, it, expect } from 'vitest'
import {
  arrayToHex,
  hexToArray,
  deriveKey,
  encrypt,
  decrypt,
  ITERATIONS_V2
} from './crypto-native'

describe('crypto-native', () => {
  describe('arrayToHex', () => {
    it('converts Uint8Array to hex string', () => {
      const input = new Uint8Array([0, 1, 15, 16, 255])
      expect(arrayToHex(input)).toBe('00010f10ff')
    })

    it('handles empty array', () => {
      expect(arrayToHex(new Uint8Array([]))).toBe('')
    })
  })

  describe('hexToArray', () => {
    it('converts hex string to Uint8Array', () => {
      const result = hexToArray('00010f10ff')
      expect(Array.from(result)).toEqual([0, 1, 15, 16, 255])
    })

    it('handles empty string', () => {
      const result = hexToArray('')
      expect(result.length).toBe(0)
    })
  })

  describe('arrayToHex/hexToArray round-trip', () => {
    it('preserves data through round-trip', () => {
      const original = new Uint8Array([0, 127, 128, 255, 1, 2, 3])
      const hex = arrayToHex(original)
      const restored = hexToArray(hex)
      expect(Array.from(restored)).toEqual(Array.from(original))
    })
  })

  describe('deriveKey', () => {
    it('derives a CryptoKey from password and salt', async () => {
      const salt = new Uint8Array(16).fill(1)
      // Use fewer iterations for test speed
      const key = await deriveKey('testpassword', salt, 1000)

      expect(key).toBeDefined()
      expect(key.type).toBe('secret')
      expect(key.algorithm.name).toBe('AES-GCM')
    })

    it('produces same key for same inputs', async () => {
      const salt = new Uint8Array(16).fill(42)
      const key1 = await deriveKey('password', salt, 1000)
      const key2 = await deriveKey('password', salt, 1000)

      // Export keys to compare (since CryptoKey objects aren't directly comparable)
      // We can't export non-extractable keys, so we test by encrypting same data
      const iv = new Uint8Array(12).fill(1)
      const data = new TextEncoder().encode('test')

      const encrypted1 = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key1, data)
      const encrypted2 = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key2, data)

      expect(arrayToHex(new Uint8Array(encrypted1))).toBe(arrayToHex(new Uint8Array(encrypted2)))
    })

    it('produces different keys for different passwords', async () => {
      const salt = new Uint8Array(16).fill(42)
      const key1 = await deriveKey('password1', salt, 1000)
      const key2 = await deriveKey('password2', salt, 1000)

      const iv = new Uint8Array(12).fill(1)
      const data = new TextEncoder().encode('test')

      const encrypted1 = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key1, data)
      const encrypted2 = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key2, data)

      expect(arrayToHex(new Uint8Array(encrypted1))).not.toBe(arrayToHex(new Uint8Array(encrypted2)))
    })

    it('uses ITERATIONS_V2 by default', () => {
      expect(ITERATIONS_V2).toBe(900000)
    })
  })

  describe('encrypt/decrypt', () => {
    // Use low iterations for test speed
    const testPassword = 'test-password-123'

    it('encrypts and decrypts string data', async () => {
      const original = 'Hello, World!'
      const encrypted = await encrypt(original, testPassword)
      const decrypted = await decrypt(encrypted, testPassword)

      expect(decrypted).toBe(original)
    })

    it('encrypts and decrypts object data', async () => {
      const original = { name: 'Test', value: 42, nested: { a: 1 } }
      const encrypted = await encrypt(original, testPassword)
      const decrypted = await decrypt(encrypted, testPassword)

      expect(decrypted).toEqual(original)
    })

    it('encrypts and decrypts array data', async () => {
      const original = [1, 'two', { three: 3 }]
      const encrypted = await encrypt(original, testPassword)
      const decrypted = await decrypt(encrypted, testPassword)

      expect(decrypted).toEqual(original)
    })

    it('returns object with salt, iv, and ciphertext', async () => {
      const encrypted = await encrypt('test', testPassword)

      expect(encrypted).toHaveProperty('salt')
      expect(encrypted).toHaveProperty('iv')
      expect(encrypted).toHaveProperty('ciphertext')
      expect(typeof encrypted.salt).toBe('string')
      expect(typeof encrypted.iv).toBe('string')
      expect(typeof encrypted.ciphertext).toBe('string')
    })

    it('generates different salt/iv for each encryption', async () => {
      const encrypted1 = await encrypt('test', testPassword)
      const encrypted2 = await encrypt('test', testPassword)

      // Salt and IV should be different (random)
      expect(encrypted1.salt).not.toBe(encrypted2.salt)
      expect(encrypted1.iv).not.toBe(encrypted2.iv)
      // Ciphertext will also differ due to different IV
      expect(encrypted1.ciphertext).not.toBe(encrypted2.ciphertext)
    })

    it('throws error with wrong password', async () => {
      const encrypted = await encrypt('secret data', testPassword)

      await expect(decrypt(encrypted, 'wrong-password'))
        .rejects.toThrow()
    })

    it('handles empty string', async () => {
      const encrypted = await encrypt('', testPassword)
      const decrypted = await decrypt(encrypted, testPassword)

      expect(decrypted).toBe('')
    })

    it('handles unicode data', async () => {
      const original = '你好世界 🌍 émojis'
      const encrypted = await encrypt(original, testPassword)
      const decrypted = await decrypt(encrypted, testPassword)

      expect(decrypted).toBe(original)
    })

    it('handles large data', async () => {
      const original = { data: 'x'.repeat(10000) }
      const encrypted = await encrypt(original, testPassword)
      const decrypted = await decrypt(encrypted, testPassword)

      expect(decrypted).toEqual(original)
    })
  })
})
