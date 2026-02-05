// Copyright (C) 2026 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

/**
 * v2 Multi-Wallet Vault Storage Module
 *
 * Stores multiple wallets in a single encrypted vault blob using AES-GCM
 * with PBKDF2-SHA256 key derivation (900,000 iterations).
 *
 * Storage keys (IndexedDB):
 * - 'vault': Encrypted vault blob containing all wallet data
 * - 'address': Cached active wallet address (for display when locked)
 * - 'active-wallet-id': Persisted active wallet ID (readable without password)
 *
 * Decrypted vault structure:
 * {
 *   wallets: [
 *     {
 *       id: "uuid",
 *       name: "Wallet Name",
 *       publicKey: "hex",
 *       privateKey: "hex"
 *     }
 *   ]
 * }
 */

import * as xe from '@edge/xe-utils'
import { store } from './'
import { encrypt, decrypt, ITERATIONS_V2 } from '../crypto-native'
import { get, set, del } from 'idb-keyval'

const KEY_VAULT = 'vault'
const KEY_ADDRESS = 'address'
const KEY_ACTIVE_WALLET_ID = 'active-wallet-id'

/**
 * Mutex for atomic vault operations.
 * Ensures only one vault write operation runs at a time.
 */
let operationLock = Promise.resolve()

/**
 * Execute a function with exclusive vault access.
 *
 * @param {Function} fn - Function to execute
 * @returns {Promise<*>} Result of the function
 */
const withLock = async (fn) => {
  const previousLock = operationLock
  let resolve
  operationLock = new Promise(r => { resolve = r })
  try {
    await previousLock
    return await fn()
  } finally {
    resolve()
  }
}

/**
 * Decrypt and return the full vault data.
 *
 * @param {string} password - Password to decrypt the vault
 * @returns {Promise<{wallets: Array}|null>} Decrypted vault data, or null if no vault exists
 * @throws {Error} If decryption fails (wrong password or corrupted data)
 */
export async function getVault(password) {
  const encryptedVault = await get(KEY_VAULT, store)
  if (encryptedVault === undefined) {
    return null
  }

  try {
    const vaultData = await decrypt(encryptedVault, password)
    if (!vaultData || !Array.isArray(vaultData.wallets)) {
      throw new Error('Vault data is malformed: missing wallets array')
    }
    return vaultData
  } catch (error) {
    if (error.name === 'OperationError') {
      throw new Error('Failed to decrypt vault: incorrect password or corrupted data')
    }
    throw error
  }
}

/**
 * Encrypt and store vault data atomically.
 *
 * @param {{wallets: Array}} vaultData - Vault data to encrypt and store
 * @param {string} password - Password for encryption
 * @returns {Promise<void>}
 */
export async function setVault(vaultData, password) {
  if (!vaultData || !Array.isArray(vaultData.wallets)) {
    throw new Error('Invalid vault data: wallets array is required')
  }

  await withLock(async () => {
    const encrypted = await encrypt(vaultData, password)
    const storedVault = {
      version: 2,
      iterations: ITERATIONS_V2,
      ...encrypted
    }
    await set(KEY_VAULT, storedVault, store)
  })
}

/**
 * Create a new vault with an initial wallet.
 *
 * @param {{ publicKey: string, privateKey: string, name?: string }} wallet - Initial wallet
 * @param {string} password - Password for encryption
 * @returns {Promise<{ id: string, name: string, address: string }>} Created wallet metadata
 */
export async function createVault(wallet, password) {
  const walletId = crypto.randomUUID()
  const address = xe.wallet.deriveAddress(wallet.publicKey)

  const walletEntry = {
    id: walletId,
    name: wallet.name || 'Main Wallet',
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey
  }

  const vaultData = {
    wallets: [walletEntry]
  }

  await setVault(vaultData, password)
  await setActiveWalletId(walletId)
  await set(KEY_ADDRESS, address, store)

  return {
    id: walletId,
    name: walletEntry.name,
    address
  }
}

/**
 * Get the active wallet ID (does not require password).
 *
 * @returns {Promise<string|null>} Active wallet ID, or null if not set
 */
export async function getActiveWalletId() {
  const id = await get(KEY_ACTIVE_WALLET_ID, store)
  return id || null
}

/**
 * Set the active wallet ID and update cached address.
 *
 * @param {string} walletId - Wallet ID to set as active
 * @param {string} [password] - Password to decrypt vault (needed to update cached address)
 * @returns {Promise<void>}
 */
export async function setActiveWalletId(walletId, password) {
  await set(KEY_ACTIVE_WALLET_ID, walletId, store)

  // Update cached address if password provided
  if (password) {
    const vault = await getVault(password)
    if (vault) {
      const wallet = vault.wallets.find(w => w.id === walletId)
      if (wallet) {
        const address = xe.wallet.deriveAddress(wallet.publicKey)
        await set(KEY_ADDRESS, address, store)
      }
    }
  }
}

/**
 * Get cached address (for display when locked, does not require password).
 *
 * @returns {Promise<string|undefined>} Cached address
 */
export async function getCachedAddress() {
  return await get(KEY_ADDRESS, store)
}

/**
 * Get wallet address by ID.
 *
 * @param {string} password - Password to decrypt vault
 * @param {string} [walletId] - Wallet ID (defaults to active wallet)
 * @returns {Promise<string|undefined>} Wallet address
 */
export async function getAddress(password, walletId) {
  const vault = await getVault(password)
  if (!vault) return undefined

  const targetId = walletId || await getActiveWalletId()
  const wallet = vault.wallets.find(w => w.id === targetId)
  return wallet ? xe.wallet.deriveAddress(wallet.publicKey) : undefined
}

/**
 * Get wallet public key by ID.
 *
 * @param {string} password - Password to decrypt vault
 * @param {string} [walletId] - Wallet ID (defaults to active wallet)
 * @returns {Promise<string|undefined>} Public key hex string
 */
export async function getPublicKey(password, walletId) {
  const vault = await getVault(password)
  if (!vault) return undefined

  const targetId = walletId || await getActiveWalletId()
  const wallet = vault.wallets.find(w => w.id === targetId)
  return wallet?.publicKey
}

/**
 * Get wallet private key by ID.
 *
 * @param {string} password - Password to decrypt vault
 * @param {string} [walletId] - Wallet ID (defaults to active wallet)
 * @returns {Promise<string|undefined>} Private key hex string
 */
export async function getPrivateKey(password, walletId) {
  const vault = await getVault(password)
  if (!vault) return undefined

  const targetId = walletId || await getActiveWalletId()
  const wallet = vault.wallets.find(w => w.id === targetId)
  return wallet?.privateKey
}

/**
 * Verify that the provided password can decrypt the vault.
 *
 * @param {string} password - Password to verify
 * @returns {Promise<boolean>} true if password is correct
 */
export async function comparePassword(password) {
  try {
    const vault = await getVault(password)
    return vault !== null
  } catch {
    return false
  }
}

/**
 * Get all wallets metadata (without private keys).
 *
 * @param {string} password - Password to decrypt vault
 * @returns {Promise<Array<{ id: string, name: string, address: string }>>}
 */
export async function getWallets(password) {
  const vault = await getVault(password)
  if (!vault) return []

  return vault.wallets.map(w => ({
    id: w.id,
    name: w.name,
    address: xe.wallet.deriveAddress(w.publicKey)
  }))
}

/**
 * Validate that a wallet name is unique (case-insensitive).
 *
 * @param {Array} wallets - Current wallets array
 * @param {string} name - Name to validate
 * @param {string} [excludeId] - Wallet ID to exclude (for updates)
 * @returns {boolean} true if name is unique
 */
function validateNameUnique(wallets, name, excludeId) {
  const normalizedName = name.toLowerCase().trim()
  return !wallets.some(w =>
    w.id !== excludeId && w.name.toLowerCase().trim() === normalizedName
  )
}

/**
 * Add a new wallet to the vault.
 *
 * @param {{ publicKey: string, privateKey: string, name?: string }} wallet - Wallet to add
 * @param {string} password - Password to decrypt/encrypt vault
 * @param {{ setActive?: boolean }} [options] - Options
 * @returns {Promise<{ id: string, name: string, address: string }>} Created wallet metadata
 * @throws {Error} If wallet already exists or name is not unique
 */
export async function addWallet(wallet, password, options = {}) {
  const { setActive = true } = options

  const vault = await getVault(password)
  if (!vault) {
    throw new Error('Vault not found. Create a vault first.')
  }

  // Check for duplicate by public key
  const existingWallet = vault.wallets.find(w => w.publicKey === wallet.publicKey)
  if (existingWallet) {
    throw new Error(`This wallet already exists as "${existingWallet.name}"`)
  }

  // Generate name if not provided
  const name = wallet.name || `Wallet ${vault.wallets.length + 1}`

  // Validate name uniqueness
  if (!validateNameUnique(vault.wallets, name)) {
    throw new Error('A wallet with this name already exists')
  }

  const walletId = crypto.randomUUID()
  const address = xe.wallet.deriveAddress(wallet.publicKey)

  const walletEntry = {
    id: walletId,
    name,
    publicKey: wallet.publicKey,
    privateKey: wallet.privateKey
  }

  vault.wallets.push(walletEntry)
  await setVault(vault, password)

  // Set as active if requested
  if (setActive) {
    await setActiveWalletId(walletId)
    await set(KEY_ADDRESS, address, store)
  }

  return {
    id: walletId,
    name: walletEntry.name,
    address
  }
}

/**
 * Remove a wallet from the vault.
 *
 * @param {string} walletId - ID of wallet to remove
 * @param {string} password - Password to decrypt/encrypt vault
 * @returns {Promise<{ walletsRemaining: number, newActiveId: string|null }>}
 * @throws {Error} If wallet not found
 */
export async function removeWallet(walletId, password) {
  const vault = await getVault(password)
  if (!vault) {
    throw new Error('Vault not found')
  }

  const walletIndex = vault.wallets.findIndex(w => w.id === walletId)
  if (walletIndex === -1) {
    throw new Error('Wallet not found')
  }

  vault.wallets.splice(walletIndex, 1)
  await setVault(vault, password)

  // Handle active wallet change
  const currentActiveId = await getActiveWalletId()
  let newActiveId = currentActiveId

  if (currentActiveId === walletId) {
    if (vault.wallets.length > 0) {
      // Switch to first remaining wallet
      newActiveId = vault.wallets[0].id
      const newActiveWallet = vault.wallets[0]
      await setActiveWalletId(newActiveId)
      await set(KEY_ADDRESS, xe.wallet.deriveAddress(newActiveWallet.publicKey), store)
    } else {
      // No wallets left
      newActiveId = null
      await del(KEY_ACTIVE_WALLET_ID, store)
      await del(KEY_ADDRESS, store)
    }
  }

  return {
    walletsRemaining: vault.wallets.length,
    newActiveId
  }
}

/**
 * Update wallet name.
 *
 * @param {string} walletId - ID of wallet to update
 * @param {string} name - New name
 * @param {string} password - Password to decrypt/encrypt vault
 * @returns {Promise<void>}
 * @throws {Error} If wallet not found or name not unique
 */
export async function updateWallet(walletId, name, password) {
  const vault = await getVault(password)
  if (!vault) {
    throw new Error('Vault not found')
  }

  const wallet = vault.wallets.find(w => w.id === walletId)
  if (!wallet) {
    throw new Error('Wallet not found')
  }

  if (!validateNameUnique(vault.wallets, name, walletId)) {
    throw new Error('A wallet with this name already exists')
  }

  wallet.name = name.trim()
  await setVault(vault, password)
}

/**
 * Check if a vault exists.
 *
 * @returns {Promise<boolean>}
 */
export async function hasVault() {
  const encryptedVault = await get(KEY_VAULT, store)
  return encryptedVault !== undefined
}

/**
 * Clear the vault (for "forget wallet" functionality).
 *
 * @returns {Promise<void>}
 */
export async function clearVault() {
  await del(KEY_VAULT, store)
  await del(KEY_ADDRESS, store)
  await del(KEY_ACTIVE_WALLET_ID, store)
}
