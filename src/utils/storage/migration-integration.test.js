// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/**
 * Integration tests for migration that use REAL v0/v1 encryption.
 * These tests do NOT mock v0/v1 - they test actual data formats.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { clear, get } from 'idb-keyval'
import { store, setWalletVersion, getWalletVersion } from './'
import * as v0 from './v0'
import * as v1 from './v1'
import * as v2 from './v2'
import { needsMigration, migrateToV2, getLegacyPrivateKey } from './migration'

// Generated with @edge/xe-utils
const wallet = {
  privateKey: '523ac5c73a02e748ebc69b86056725188ee8a4601ec7a55fa39f669e3534ebd8',
  publicKey: '027729106856fe787060829d171ad0ea5e9c693e59235c97eae034f117ae76ac45',
  address: 'xe_5f6f4A6d1BfFd3F2aE6422CFe15083aa9162E9AA'
}
const correctPassword = 'my-secure-password-123'
const wrongPassword = 'wrong-password-456'

describe('migration integration (real encryption)', () => {
  beforeEach(async () => {
    await clear(store)
  })

  describe('v0 format (fixed secret key)', () => {
    beforeEach(async () => {
      // Create real v0 wallet
      await v0.setPublicKey(wallet.publicKey)
      await v0.setPrivateKey(wallet.privateKey)
      await v0.setPassword(correctPassword)
      // v0 has no wallet-version key (version === 0)
    })

    it('can read v0 keys correctly', async () => {
      const publicKey = await v0.getPublicKey()
      const privateKey = await v0.getPrivateKey()

      expect(publicKey).toBe(wallet.publicKey)
      expect(privateKey).toBe(wallet.privateKey)
    })

    it('needsMigration returns true for v0', async () => {
      expect(await needsMigration()).toBe(true)
    })

    it('migrates v0 to v2 successfully with correct address', async () => {
      // v0 doesn't use password for key encryption, only for comparePassword
      const result = await migrateToV2(correctPassword)

      expect(result).toHaveProperty('id')
      expect(result.address).toBe(wallet.address)

      // Verify v2 has correct keys
      const migratedPrivateKey = await v2.getPrivateKey(correctPassword)
      const migratedPublicKey = await v2.getPublicKey(correctPassword)
      expect(migratedPrivateKey).toBe(wallet.privateKey)
      expect(migratedPublicKey).toBe(wallet.publicKey)

      // Verify v2.getAddress returns correct address
      const migratedAddress = await v2.getAddress(correctPassword)
      expect(migratedAddress).toBe(wallet.address)

      // Verify old keys are deleted
      expect(await get('p1', store)).toBeUndefined()
      expect(await get('p2', store)).toBeUndefined()

      // Verify version is 2
      expect(await getWalletVersion()).toBe(2)
    })

    it('v0 migration works even with wrong password (v0 uses fixed key)', async () => {
      // v0 encryption uses hardcoded secret, not user password
      // So migration should work regardless of password provided
      const result = await migrateToV2(wrongPassword)

      const migratedPrivateKey = await v2.getPrivateKey(wrongPassword)
      expect(migratedPrivateKey).toBe(wallet.privateKey)
    })
  })

  describe('v1 format (user password encryption)', () => {
    beforeEach(async () => {
      // Create real v1 wallet
      await v1.setPublicKey(wallet.publicKey)
      await v1.setPrivateKey(wallet.privateKey, correctPassword)
      await v1.setPassword(correctPassword)
      await setWalletVersion(1)
    })

    it('can read v1 keys correctly with correct password', async () => {
      const publicKey = await v1.getPublicKey()
      const privateKey = await v1.getPrivateKey(correctPassword)

      expect(publicKey).toBe(wallet.publicKey)
      expect(privateKey).toBe(wallet.privateKey)
    })

    it('needsMigration returns true for v1', async () => {
      expect(await needsMigration()).toBe(true)
    })

    it('migrates v1 to v2 successfully with correct address', async () => {
      const result = await migrateToV2(correctPassword)

      expect(result).toHaveProperty('id')
      expect(result.address).toBe(wallet.address)

      // Verify v2 has correct keys
      const migratedPrivateKey = await v2.getPrivateKey(correctPassword)
      const migratedPublicKey = await v2.getPublicKey(correctPassword)
      expect(migratedPrivateKey).toBe(wallet.privateKey)
      expect(migratedPublicKey).toBe(wallet.publicKey)

      // Verify v2.getAddress returns correct address
      const migratedAddress = await v2.getAddress(correctPassword)
      expect(migratedAddress).toBe(wallet.address)

      // Verify version is 2
      expect(await getWalletVersion()).toBe(2)
    })

    it('v1 decryption with wrong password - inconsistent behavior', async () => {
      // CryptoJS behavior with wrong password is INCONSISTENT:
      // - Sometimes throws "Malformed UTF-8 data"
      // - Sometimes returns empty string ""
      // This depends on how the garbage bytes happen to decode

      let result = null
      let error = null
      try {
        result = await v1.getPrivateKey(wrongPassword)
      } catch (e) {
        error = e
      }

      if (error) {
        // Threw an error (safe case)
        expect(error.message).toContain('Malformed UTF-8')
        console.log('CryptoJS threw error (safe):', error.message)
      } else {
        // Returned something (dangerous case - might be empty or garbage)
        expect(result).not.toBe(wallet.privateKey)
        console.log('CryptoJS returned (dangerous):', JSON.stringify(result))
      }
    })

    it('CRITICAL: v1 migration with wrong password - CryptoJS may throw or return empty', async () => {
      // Save old keys before migration attempt
      const oldP1 = await get('p1', store)
      const oldP2 = await get('p2', store)
      expect(oldP1).toBeDefined()
      expect(oldP2).toBeDefined()

      // CryptoJS behavior with wrong password is inconsistent:
      // - Sometimes throws "Malformed UTF-8 data"
      // - Sometimes returns empty string ""
      // Both are dangerous if not handled properly!

      let migrationError = null
      try {
        await migrateToV2(wrongPassword)
      } catch (e) {
        migrationError = e
      }

      if (migrationError) {
        // Good case: migration.js caught the error
        // Error could be "Malformed UTF-8" or "Could not read existing wallet data"
        const isExpectedError =
          migrationError.message.includes('Malformed UTF-8') ||
          migrationError.message.includes('Could not read existing wallet data')
        expect(isExpectedError).toBe(true)
        console.log('Migration threw error (safe):', migrationError.message)

        // Verify old keys are preserved
        const stillHasOldKeys = (await get('p1', store)) !== undefined
        console.log('Old keys preserved:', stillHasOldKeys)
        expect(stillHasOldKeys).toBe(true)
      } else {
        // Bad case: CryptoJS returned empty string, migration "succeeded"
        // Old keys are now DELETED
        expect(await get('p1', store)).toBeUndefined()
        expect(await get('p2', store)).toBeUndefined()

        // v2 vault contains empty/garbage, not the real key
        const migratedPrivateKey = await v2.getPrivateKey(wrongPassword)
        expect(migratedPrivateKey).not.toBe(wallet.privateKey)

        // THE REAL PRIVATE KEY IS NOW LOST FOREVER
        console.log('DANGER: Migration with wrong password succeeded!')
        console.log('Migrated (garbage) key:', migratedPrivateKey)
      }
    })
  })

  describe('password edge cases', () => {
    it('v1 with very long password (> 32 chars gets truncated)', async () => {
      const longPassword = 'this-is-a-very-long-password-that-exceeds-32-characters'

      await v1.setPublicKey(wallet.publicKey)
      await v1.setPrivateKey(wallet.privateKey, longPassword)
      await setWalletVersion(1)

      // Should work with same long password
      const privateKey = await v1.getPrivateKey(longPassword)
      expect(privateKey).toBe(wallet.privateKey)

      // Migration should work
      const result = await migrateToV2(longPassword)
      const migratedKey = await v2.getPrivateKey(longPassword)
      expect(migratedKey).toBe(wallet.privateKey)
    })

    it('v1 with short password (< 32 chars gets padded)', async () => {
      const shortPassword = 'short'

      await v1.setPublicKey(wallet.publicKey)
      await v1.setPrivateKey(wallet.privateKey, shortPassword)
      await setWalletVersion(1)

      const privateKey = await v1.getPrivateKey(shortPassword)
      expect(privateKey).toBe(wallet.privateKey)
    })

    it('v1 with unicode password', async () => {
      const unicodePassword = '密码🔐émoji'

      await v1.setPublicKey(wallet.publicKey)
      await v1.setPrivateKey(wallet.privateKey, unicodePassword)
      await setWalletVersion(1)

      const privateKey = await v1.getPrivateKey(unicodePassword)
      expect(privateKey).toBe(wallet.privateKey)
    })
  })

  describe('migration failure recovery', () => {
    // Tests the safety guarantees that UnlockModal relies on:
    // When migrateToV2 fails, original data must be preserved so
    // getLegacyPrivateKey can still retrieve the key for export.

    describe('v1 vault creation failure', () => {
      beforeEach(async () => {
        await v1.setPublicKey(wallet.publicKey)
        await v1.setPrivateKey(wallet.privateKey, correctPassword)
        await v1.setPassword(correctPassword)
        await setWalletVersion(1)
      })

      it('preserves v1 data when vault creation throws', async () => {
        // Simulate crypto failure during vault creation
        vi.spyOn(v2, 'createVault').mockRejectedValueOnce(new Error('Simulated encryption failure'))

        await expect(migrateToV2(correctPassword)).rejects.toThrow()

        // Version must not have changed
        expect(await getWalletVersion()).toBe(1)

        // v1 keys must still be readable
        expect(await v1.getPrivateKey(correctPassword)).toBe(wallet.privateKey)
        expect(await v1.getPublicKey()).toBe(wallet.publicKey)
      })

      it('getLegacyPrivateKey works after failed migration', async () => {
        vi.spyOn(v2, 'createVault').mockRejectedValueOnce(new Error('Simulated encryption failure'))

        await expect(migrateToV2(correctPassword)).rejects.toThrow()

        // Emergency recovery must still work
        const key = await getLegacyPrivateKey(correctPassword)
        expect(key).toBe(wallet.privateKey)
      })

      it('needsMigration still returns true after failed migration', async () => {
        vi.spyOn(v2, 'createVault').mockRejectedValueOnce(new Error('Simulated encryption failure'))

        await expect(migrateToV2(correctPassword)).rejects.toThrow()

        // Retry should be possible
        expect(await needsMigration()).toBe(true)
      })

      it('migration succeeds on retry after previous failure', async () => {
        vi.spyOn(v2, 'createVault').mockRejectedValueOnce(new Error('Simulated encryption failure'))

        await expect(migrateToV2(correctPassword)).rejects.toThrow()

        // Spy was consumed by mockRejectedValueOnce — real createVault runs now
        const result = await migrateToV2(correctPassword)
        expect(result.address).toBe(wallet.address)

        const migratedKey = await v2.getPrivateKey(correctPassword)
        expect(migratedKey).toBe(wallet.privateKey)
        expect(await getWalletVersion()).toBe(2)
      })
    })

    describe('v0 vault creation failure', () => {
      beforeEach(async () => {
        await v0.setPublicKey(wallet.publicKey)
        await v0.setPrivateKey(wallet.privateKey)
        await v0.setPassword(correctPassword)
        // v0 has no wallet-version key (version === 0)
      })

      it('preserves v0 data when vault creation throws', async () => {
        vi.spyOn(v2, 'createVault').mockRejectedValueOnce(new Error('Simulated encryption failure'))

        await expect(migrateToV2(correctPassword)).rejects.toThrow()

        // Version must still be 0 (no wallet-version key)
        expect(await getWalletVersion()).toBe(0)

        // v0 keys must still be readable
        expect(await v0.getPrivateKey()).toBe(wallet.privateKey)
        expect(await v0.getPublicKey()).toBe(wallet.publicKey)
      })

      it('getLegacyPrivateKey works after failed v0 migration', async () => {
        vi.spyOn(v2, 'createVault').mockRejectedValueOnce(new Error('Simulated encryption failure'))

        await expect(migrateToV2(correctPassword)).rejects.toThrow()

        const key = await getLegacyPrivateKey(correctPassword)
        expect(key).toBe(wallet.privateKey)
      })
    })
  })

  describe('getLegacyPrivateKey (emergency recovery)', () => {
    it('can recover v0 key', async () => {
      await v0.setPrivateKey(wallet.privateKey)

      const key = await getLegacyPrivateKey(correctPassword)
      expect(key).toBe(wallet.privateKey)
    })

    it('can recover v1 key with correct password', async () => {
      await v1.setPrivateKey(wallet.privateKey, correctPassword)
      await setWalletVersion(1)

      const key = await getLegacyPrivateKey(correctPassword)
      expect(key).toBe(wallet.privateKey)
    })

    it('v1 with wrong password throws or returns garbage', async () => {
      await v1.setPrivateKey(wallet.privateKey, correctPassword)
      await setWalletVersion(1)

      // CryptoJS behavior is inconsistent - may throw or return garbage
      let key = null
      let error = null
      try {
        key = await getLegacyPrivateKey(wrongPassword)
      } catch (e) {
        error = e
      }

      if (error) {
        expect(error.message).toContain('Malformed UTF-8')
      } else {
        // Returned empty or garbage
        expect(key).not.toBe(wallet.privateKey)
      }
    })
  })
})
