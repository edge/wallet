// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { clear, set, get } from 'idb-keyval'
import { store } from './'
import * as v2 from './v2'
import { needsMigration, migrateToV2, getLegacyPrivateKey } from './migration'

// Generated with @edge/xe-utils
const wallet = {
  privateKey: '523ac5c73a02e748ebc69b86056725188ee8a4601ec7a55fa39f669e3534ebd8',
  publicKey: '027729106856fe787060829d171ad0ea5e9c693e59235c97eae034f117ae76ac45',
  address: 'xe_5f6f4A6d1BfFd3F2aE6422CFe15083aa9162E9AA'
}
const testPassword = 'test-password-123'

// Mock v0 module
vi.mock('./v0', () => ({
  hasWallet: vi.fn(),
  getPrivateKey: vi.fn(),
  getPublicKey: vi.fn()
}))

// Mock v1 module
vi.mock('./v1', () => ({
  getPrivateKey: vi.fn(),
  getPublicKey: vi.fn()
}))

// Import mocks after vi.mock
import * as v0 from './v0'
import * as v1 from './v1'

describe('migration', () => {
  beforeEach(async () => {
    // Clear storage and mocks
    await clear(store)
    vi.clearAllMocks()
  })

  describe('needsMigration', () => {
    it('returns false when no wallet exists (version 0, no v0 wallet)', async () => {
      v0.hasWallet.mockResolvedValue(false)
      expect(await needsMigration()).toBe(false)
    })

    it('returns true for version 0 with existing v0 wallet', async () => {
      v0.hasWallet.mockResolvedValue(true)
      expect(await needsMigration()).toBe(true)
    })

    it('returns true for version 1', async () => {
      await set('wallet-version', 1, store)
      expect(await needsMigration()).toBe(true)
    })

    it('returns false for version 2', async () => {
      await set('wallet-version', 2, store)
      expect(await needsMigration()).toBe(false)
    })
  })

  describe('migrateToV2', () => {
    describe('from v0', () => {
      beforeEach(() => {
        v0.hasWallet.mockResolvedValue(true)
        v0.getPrivateKey.mockResolvedValue(wallet.privateKey)
        v0.getPublicKey.mockResolvedValue(wallet.publicKey)
      })

      it('migrates v0 wallet to v2 vault', async () => {
        const result = await migrateToV2(testPassword)

        expect(result).toHaveProperty('id')
        expect(result).toHaveProperty('name', 'Wallet 1')
        expect(result).toHaveProperty('address')

        // Verify v2 vault exists and has correct data
        const privateKey = await v2.getPrivateKey(testPassword)
        expect(privateKey).toBe(wallet.privateKey)
      })

      it('sets wallet version to 2', async () => {
        await migrateToV2(testPassword)
        const version = await get('wallet-version', store)
        expect(version).toBe(2)
      })

      it('calls progress callback', async () => {
        const onProgress = vi.fn()
        await migrateToV2(testPassword, onProgress)

        expect(onProgress).toHaveBeenCalledWith('reading')
        expect(onProgress).toHaveBeenCalledWith('encrypting')
        expect(onProgress).toHaveBeenCalledWith('verifying')
        expect(onProgress).toHaveBeenCalledWith('cleanup')
      })

      it('throws error if wallet data is missing', async () => {
        v0.getPrivateKey.mockResolvedValue(undefined)

        await expect(migrateToV2(testPassword))
          .rejects.toThrow('Could not read existing wallet data')
      })
    })

    describe('from v1', () => {
      beforeEach(async () => {
        await set('wallet-version', 1, store)
        v1.getPrivateKey.mockResolvedValue(wallet.privateKey)
        v1.getPublicKey.mockResolvedValue(wallet.publicKey)
      })

      it('migrates v1 wallet to v2 vault', async () => {
        const result = await migrateToV2(testPassword)

        expect(result).toHaveProperty('id')
        expect(result.name).toBe('Wallet 1')

        const privateKey = await v2.getPrivateKey(testPassword)
        expect(privateKey).toBe(wallet.privateKey)
      })

      it('passes password to v1 decryption', async () => {
        await migrateToV2(testPassword)
        expect(v1.getPrivateKey).toHaveBeenCalledWith(testPassword)
      })
    })

    it('throws error when already on v2', async () => {
      await set('wallet-version', 2, store)
      await expect(migrateToV2(testPassword))
        .rejects.toThrow('Already on v2 or no wallet exists')
    })

    it('rolls back version on verification failure', async () => {
      await set('wallet-version', 1, store)
      v1.getPrivateKey.mockResolvedValue(wallet.privateKey)
      v1.getPublicKey.mockResolvedValue(wallet.publicKey)

      // Mock v2.getPrivateKey to return wrong value (simulating corruption)
      const originalGetPrivateKey = v2.getPrivateKey
      vi.spyOn(v2, 'getPrivateKey').mockResolvedValueOnce('corrupted-key')

      await expect(migrateToV2(testPassword))
        .rejects.toThrow('Migration verification failed')

      // Version should be rolled back
      const version = await get('wallet-version', store)
      expect(version).toBe(1)

      // Restore original
      v2.getPrivateKey.mockRestore()
    })
  })

  describe('getLegacyPrivateKey', () => {
    it('returns v0 private key for version 0', async () => {
      v0.hasWallet.mockResolvedValue(true)
      v0.getPrivateKey.mockResolvedValue(wallet.privateKey)

      const key = await getLegacyPrivateKey(testPassword)
      expect(key).toBe(wallet.privateKey)
    })

    it('returns v1 private key for version 1', async () => {
      await set('wallet-version', 1, store)
      v1.getPrivateKey.mockResolvedValue(wallet.privateKey)

      const key = await getLegacyPrivateKey(testPassword)
      expect(key).toBe(wallet.privateKey)
      expect(v1.getPrivateKey).toHaveBeenCalledWith(testPassword)
    })

    it('returns undefined for version 2', async () => {
      await set('wallet-version', 2, store)
      const key = await getLegacyPrivateKey(testPassword)
      expect(key).toBeUndefined()
    })
  })
})
