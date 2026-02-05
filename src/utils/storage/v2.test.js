// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { clear } from 'idb-keyval'
import { store } from './'
import * as v2 from './v2'

// Generated with @edge/xe-utils
const wallet1 = {
  privateKey: '523ac5c73a02e748ebc69b86056725188ee8a4601ec7a55fa39f669e3534ebd8',
  publicKey: '027729106856fe787060829d171ad0ea5e9c693e59235c97eae034f117ae76ac45',
  address: 'xe_5f6f4A6d1BfFd3F2aE6422CFe15083aa9162E9AA'
}

const wallet2 = {
  privateKey: 'dcb82cb47f8c81d3a677160b79d2670fa56f382181bd56d4b0e4b7bd7f171b23',
  publicKey: '02dd35fc530d9e9a29de3558d16b6f624fa40a8b69c337a0b2975258ae843837ae',
  address: 'xe_8508394bcede57266C6E5019208907A7CC475019'
}

const testPassword = 'test-password-123'

describe('v2 storage', () => {
  beforeEach(async () => {
    // Clear IndexedDB before each test
    await clear(store)
  })

  describe('hasVault', () => {
    it('returns false when no vault exists', async () => {
      expect(await v2.hasVault()).toBe(false)
    })

    it('returns true after vault is created', async () => {
      await v2.createVault(wallet1, testPassword)
      expect(await v2.hasVault()).toBe(true)
    })
  })

  describe('createVault', () => {
    it('creates vault with initial wallet', async () => {
      const result = await v2.createVault(wallet1, testPassword)

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('address')
      expect(result.name).toBe('Wallet 1')
      expect(typeof result.id).toBe('string')
      expect(typeof result.address).toBe('string')
    })

    it('uses custom name when provided', async () => {
      const result = await v2.createVault(
        { ...wallet1, name: 'My Custom Wallet' },
        testPassword
      )

      expect(result.name).toBe('My Custom Wallet')
    })

    it('sets active wallet ID', async () => {
      const result = await v2.createVault(wallet1, testPassword)
      const activeId = await v2.getActiveWalletId()

      expect(activeId).toBe(result.id)
    })
  })

  describe('getVault/setVault', () => {
    it('returns null when no vault exists', async () => {
      const vault = await v2.getVault(testPassword)
      expect(vault).toBeNull()
    })

    it('retrieves vault after creation', async () => {
      await v2.createVault(wallet1, testPassword)
      const vault = await v2.getVault(testPassword)

      expect(vault).toHaveProperty('wallets')
      expect(Array.isArray(vault.wallets)).toBe(true)
      expect(vault.wallets.length).toBe(1)
    })

    it('throws error with wrong password', async () => {
      await v2.createVault(wallet1, testPassword)

      await expect(v2.getVault('wrong-password'))
        .rejects.toThrow('Failed to decrypt vault')
    })
  })

  describe('getActiveWalletId/setActiveWalletId', () => {
    it('returns null when not set', async () => {
      expect(await v2.getActiveWalletId()).toBeNull()
    })

    it('persists active wallet ID', async () => {
      await v2.setActiveWalletId('test-id-123')
      expect(await v2.getActiveWalletId()).toBe('test-id-123')
    })
  })

  describe('comparePassword', () => {
    it('returns false when no vault exists', async () => {
      expect(await v2.comparePassword(testPassword)).toBe(false)
    })

    it('returns true for correct password', async () => {
      await v2.createVault(wallet1, testPassword)
      expect(await v2.comparePassword(testPassword)).toBe(true)
    })

    it('returns false for wrong password', async () => {
      await v2.createVault(wallet1, testPassword)
      expect(await v2.comparePassword('wrong-password')).toBe(false)
    })
  })

  describe('getAddress/getPublicKey/getPrivateKey', () => {
    beforeEach(async () => {
      await v2.createVault(wallet1, testPassword)
    })

    it('getAddress returns correct derived address', async () => {
      const address = await v2.getAddress(testPassword)
      expect(address).toBe(wallet1.address)
    })

    it('getPublicKey returns public key', async () => {
      const publicKey = await v2.getPublicKey(testPassword)
      expect(publicKey).toBe(wallet1.publicKey)
    })

    it('getPrivateKey returns private key', async () => {
      const privateKey = await v2.getPrivateKey(testPassword)
      expect(privateKey).toBe(wallet1.privateKey)
    })

    it('returns undefined with wrong password', async () => {
      await expect(v2.getAddress('wrong'))
        .rejects.toThrow()
    })
  })

  describe('getWallets', () => {
    it('returns empty array when no vault', async () => {
      const wallets = await v2.getWallets(testPassword)
      expect(wallets).toEqual([])
    })

    it('returns wallet metadata without private keys', async () => {
      await v2.createVault(wallet1, testPassword)
      const wallets = await v2.getWallets(testPassword)

      expect(wallets.length).toBe(1)
      expect(wallets[0]).toHaveProperty('id')
      expect(wallets[0]).toHaveProperty('name')
      expect(wallets[0]).toHaveProperty('address')
      expect(wallets[0]).not.toHaveProperty('privateKey')
      expect(wallets[0]).not.toHaveProperty('publicKey')
    })
  })

  describe('addWallet', () => {
    beforeEach(async () => {
      await v2.createVault(wallet1, testPassword)
    })

    it('adds wallet to existing vault', async () => {
      const result = await v2.addWallet(wallet2, testPassword)

      expect(result).toHaveProperty('id')
      expect(result).toHaveProperty('name')
      expect(result).toHaveProperty('address')

      const wallets = await v2.getWallets(testPassword)
      expect(wallets.length).toBe(2)
    })

    it('auto-generates name when not provided', async () => {
      const result = await v2.addWallet(wallet2, testPassword)
      expect(result.name).toBe('Wallet 2')
    })

    it('uses custom name when provided', async () => {
      const result = await v2.addWallet(
        { ...wallet2, name: 'Savings' },
        testPassword
      )
      expect(result.name).toBe('Savings')
    })

    it('sets new wallet as active by default', async () => {
      const result = await v2.addWallet(wallet2, testPassword)
      const activeId = await v2.getActiveWalletId()
      expect(activeId).toBe(result.id)
    })

    it('does not set active when setActive=false', async () => {
      const beforeActiveId = await v2.getActiveWalletId()
      await v2.addWallet(wallet2, testPassword, { setActive: false })
      const afterActiveId = await v2.getActiveWalletId()
      expect(afterActiveId).toBe(beforeActiveId)
    })

    it('throws error for duplicate public key', async () => {
      await expect(v2.addWallet(wallet1, testPassword))
        .rejects.toThrow('This wallet already exists')
    })

    it('throws error for duplicate name', async () => {
      await expect(v2.addWallet(
        { ...wallet2, name: 'Wallet 1' },
        testPassword
      )).rejects.toThrow('A wallet with this name already exists')
    })

    it('name validation is case-insensitive', async () => {
      await expect(v2.addWallet(
        { ...wallet2, name: 'WALLET 1' },
        testPassword
      )).rejects.toThrow('A wallet with this name already exists')
    })

    it('throws error when no vault exists', async () => {
      await clear(store)
      await expect(v2.addWallet(wallet2, testPassword))
        .rejects.toThrow('Vault not found')
    })
  })

  describe('removeWallet', () => {
    let wallet1Id, wallet2Id

    beforeEach(async () => {
      const w1 = await v2.createVault(wallet1, testPassword)
      wallet1Id = w1.id
      const w2 = await v2.addWallet(wallet2, testPassword, { setActive: false })
      wallet2Id = w2.id
    })

    it('removes wallet from vault', async () => {
      await v2.removeWallet(wallet2Id, testPassword)
      const wallets = await v2.getWallets(testPassword)
      expect(wallets.length).toBe(1)
      expect(wallets[0].id).toBe(wallet1Id)
    })

    it('returns remaining count and new active ID', async () => {
      const result = await v2.removeWallet(wallet2Id, testPassword)
      expect(result.walletsRemaining).toBe(1)
      expect(result.newActiveId).toBe(wallet1Id)
    })

    it('switches to first wallet when active is removed', async () => {
      await v2.setActiveWalletId(wallet2Id)
      const result = await v2.removeWallet(wallet2Id, testPassword)
      expect(result.newActiveId).toBe(wallet1Id)
      expect(await v2.getActiveWalletId()).toBe(wallet1Id)
    })

    it('removes all wallets (empty vault)', async () => {
      await v2.removeWallet(wallet2Id, testPassword)
      const result = await v2.removeWallet(wallet1Id, testPassword)
      expect(result.walletsRemaining).toBe(0)
      expect(result.newActiveId).toBeNull()
    })

    it('throws error for non-existent wallet', async () => {
      await expect(v2.removeWallet('fake-id', testPassword))
        .rejects.toThrow('Wallet not found')
    })
  })

  describe('updateWallet', () => {
    let walletId

    beforeEach(async () => {
      const w = await v2.createVault(wallet1, testPassword)
      walletId = w.id
    })

    it('updates wallet name', async () => {
      await v2.updateWallet(walletId, 'New Name', testPassword)
      const wallets = await v2.getWallets(testPassword)
      expect(wallets[0].name).toBe('New Name')
    })

    it('trims whitespace from name', async () => {
      await v2.updateWallet(walletId, '  Trimmed Name  ', testPassword)
      const wallets = await v2.getWallets(testPassword)
      expect(wallets[0].name).toBe('Trimmed Name')
    })

    it('throws error for duplicate name', async () => {
      await v2.addWallet({ ...wallet2, name: 'Existing' }, testPassword)
      await expect(v2.updateWallet(walletId, 'Existing', testPassword))
        .rejects.toThrow('A wallet with this name already exists')
    })

    it('allows keeping same name', async () => {
      await v2.updateWallet(walletId, 'Wallet 1', testPassword)
      const wallets = await v2.getWallets(testPassword)
      expect(wallets[0].name).toBe('Wallet 1')
    })

    it('throws error for non-existent wallet', async () => {
      await expect(v2.updateWallet('fake-id', 'Name', testPassword))
        .rejects.toThrow('Wallet not found')
    })
  })

  describe('clearVault', () => {
    it('removes vault and active wallet ID', async () => {
      await v2.createVault(wallet1, testPassword)
      expect(await v2.hasVault()).toBe(true)

      await v2.clearVault()

      expect(await v2.hasVault()).toBe(false)
      expect(await v2.getActiveWalletId()).toBeNull()
    })
  })

  describe('mutex lock', () => {
    it('serializes concurrent vault writes without corruption', async () => {
      await v2.createVault(wallet1, testPassword)
      const walletId = await v2.getActiveWalletId()

      // Start multiple writes concurrently
      const promises = [
        v2.updateWallet(walletId, 'Name 1', testPassword),
        v2.updateWallet(walletId, 'Name 2', testPassword),
        v2.updateWallet(walletId, 'Name 3', testPassword)
      ]

      // All should complete without errors (no race condition crashes)
      await Promise.all(promises)

      // Final state should be one of the valid names (mutex prevents corruption)
      const wallets = await v2.getWallets(testPassword)
      expect(['Name 1', 'Name 2', 'Name 3']).toContain(wallets[0].name)
    })
  })
})
