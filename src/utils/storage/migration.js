// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/**
 * Migration module for transitioning v0/v1 storage to v2 vault format.
 *
 * Follows write-verify-delete pattern:
 * 1. Read existing wallet data using legacy adapters
 * 2. Write new v2 vault format with upgraded encryption (900k PBKDF2)
 * 3. Verify the new vault can be decrypted correctly
 * 4. Delete old storage keys only after verification succeeds
 *
 * On verification failure, the version number is rolled back.
 */

import * as v0 from './v0'
import * as v1 from './v1'
import * as v2 from './v2'
import { store, getWalletVersion, setWalletVersion } from './'
import { del } from 'idb-keyval'

/**
 * Check if migration to v2 is needed.
 *
 * @returns {Promise<boolean>} true if migration is needed
 */
export async function needsMigration() {
  const version = await getWalletVersion()

  // Version 0 is returned when no wallet-version key exists
  // Check if there's actually a wallet to migrate
  if (version === 0) {
    return await v0.hasWallet()
  }

  return version === 1
}

/**
 * Migrate wallet from v0 or v1 format to v2 vault format.
 *
 * Safe migration following write-verify-delete pattern:
 * 1. Reading: Read existing wallet using legacy adapter
 * 2. Encrypting: Create v2 vault with new encryption (AES-GCM, 900k PBKDF2)
 * 3. Verifying: Decrypt new vault to confirm data integrity
 * 4. Cleanup: Delete old storage keys only after verification
 *
 * On failure, version is rolled back and error is thrown.
 *
 * @param {string} password - Password for decrypting v1 and encrypting v2
 * @param {function(string): void} [onProgress] - Progress callback
 *   Called with: 'reading', 'encrypting', 'verifying', 'cleanup'
 * @returns {Promise<{ id: string, name: string, address: string }>} Migrated wallet metadata
 * @throws {Error} If migration fails at any step
 */
export async function migrateToV2(password, onProgress) {
  onProgress?.('reading')

  // 1. Get current version and read with appropriate adapter
  const version = await getWalletVersion()
  let privateKey, publicKey

  if (version === 0) {
    privateKey = await v0.getPrivateKey()
    publicKey = await v0.getPublicKey()
  } else if (version === 1) {
    privateKey = await v1.getPrivateKey(password)
    publicKey = await v1.getPublicKey()
  } else {
    throw new Error('Already on v2 or no wallet exists')
  }

  if (!privateKey || !publicKey) {
    throw new Error('Could not read existing wallet data')
  }

  onProgress?.('encrypting')

  // 2. Create new v2 vault with migrated wallet
  const walletMeta = await v2.createVault({
    publicKey,
    privateKey,
    name: 'Wallet 1'
  }, password)

  // 3. Update version
  await setWalletVersion(2)

  onProgress?.('verifying')

  // 4. Verify decryption works and data matches
  const verifiedPrivateKey = await v2.getPrivateKey(password)
  if (verifiedPrivateKey !== privateKey) {
    // Rollback on verification failure
    await setWalletVersion(version)
    throw new Error('Migration verification failed - private key mismatch')
  }

  onProgress?.('cleanup')

  // 5. Delete old format keys only after verification
  await Promise.all([
    del('p1', store),
    del('p2', store),
    del('h', store),
    del('s', store),
    del('unlock-expiry', store)
  ])

  return walletMeta
}

/**
 * Get the private key from legacy storage (for emergency recovery).
 *
 * Use this if migration fails and user needs to export their key.
 *
 * @param {string} password - Password (only needed for v1)
 * @returns {Promise<string|undefined>} Private key or undefined
 */
export async function getLegacyPrivateKey(password) {
  const version = await getWalletVersion()

  if (version === 0) {
    return await v0.getPrivateKey()
  } else if (version === 1) {
    return await v1.getPrivateKey(password)
  }

  return undefined
}
