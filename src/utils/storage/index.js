// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import * as v0 from './v0'
import * as v1 from './v1'
import { clear, createStore, del, get, set } from 'idb-keyval'

const KEY_UNLOCK_EXPIRY = 'unlock-expiry'
const KEY_WALLET_VERSION = 'wallet-version'

const invalidVersion = version => new Error(`Invalid storage version ${version}`)

/**
 * All data is stored in a single edge database > wallet store.
 * `idb-keyval` does not support multiple stores:
 * https://github.com/jakearchibald/idb-keyval/blob/main/custom-stores.md#defining-a-custom-database--store-name
 */
const store = createStore('edge', 'wallet')

/**
 * Compare password input to hashed password in storage.
 *
 * The `version` argument can be provided to specify the storage model to use.
 * If it is undefined, the highest storage version will be selected automatically.
 *
 * @param {string} password Password input
 * @param {number|undefined} version Storage version
 * @returns Promise<boolean>
 */
const comparePassword = (password, version) => {
  if (version === undefined) version = getHighestWalletVersion()
  switch(version) {
  case 0:
    return v0.comparePassword(password)
  case 1:
    return v1.comparePassword(password)
  default:
    throw invalidVersion(version)
  }
}

/**
 * Clear storage.
 *
 * @returns Promise<void>
 */
const empty = () => clear(store)

/**
 * Force unlock expiry.
 *
 * @returns Promise<void>
 */
const expire = () => del(KEY_UNLOCK_EXPIRY, store)

/**
 * Get wallet address from storage.
 *
 * The `version` argument can be provided to specify the storage model to use.
 * If it is undefined, the highest storage version will be selected automatically.
 *
 * @param {number|undefined} version Storage version
 * @returns Promise<string>
 */
const getAddress = version => {
  if (version === undefined) version = getHighestWalletVersion()
  switch(version) {
  case 0:
    return v0.getAddress()
  case 1:
    return v1.getAddress()
  default:
    throw invalidVersion(version)
  }
}

/**
 * Get highest wallet version.
 *
 * @returns number
 */
const getHighestWalletVersion = () => 1

/**
 * Get wallet private key from storage.
 *
 * The `version` argument can be provided to specify the storage model to use.
 * If it is undefined, the highest storage version will be selected automatically.
 *
 * @param {number|undefined} version Storage version
 * @returns Promise<string>
 */
const getPrivateKey = (password, version) => {
  if (version === undefined) version = getHighestWalletVersion()
  switch(version) {
  case 0:
    return v0.getPrivateKey()
  case 1:
    return v1.getPrivateKey(password)
  default:
    throw invalidVersion(version)
  }
}

/**
 * Get wallet public key from storage.
 *
 * The `version` argument can be provided to specify the storage model to use.
 * If it is undefined, the highest storage version will be selected automatically.
 *
 * @param {number|undefined} version Storage version
 * @returns Promise<string>
 */
const getPublicKey = version => {
  if (version === undefined) version = getHighestWalletVersion()
  switch (version) {
  case 0:
    return v0.getPublicKey()
  case 1:
    return v1.getPublicKey()
  default:
    throw invalidVersion(version)
  }
}

/**
 * Get unlock expiry time from storage.
 *
 * @returns Promise<Date>
 */
const getUnlockExpiry = async () => {
  const dateStr = await get(KEY_UNLOCK_EXPIRY, store)
  if (!dateStr) return new Date(0)
  return new Date(dateStr)
}

/**
 * Get wallet version from storage.
 *
 * If no version is found, this function returns 0.
 *
 * @returns Promise<number>
 */
const getWalletVersion = async () => {
  const v = await get(KEY_WALLET_VERSION, store)
  if (v !== undefined) return v
  return 0
}

/**
 * Set unlock expiry time in storage.
 *
 * @param {Date} date Expiry date & time
 * @returns Promise<void>
 */
const setUnlockExpiry = (date) => set(KEY_UNLOCK_EXPIRY, date.toString(), store)

/**
 * Save wallet in storage.
 *
 * The `version` argument can be provided to specify the storage model to use.
 * If it is undefined, the highest storage version will be selected automatically.
 *
 * @param {{ privateKey: string, publicKey: string }} keypair Wallet key pair
 * @param {string} password Password with which to encrypt wallet data
 * @param {number|undefined} version Storage version
 * @returns Promise<void>
 */
const setWallet = async (keypair, password, version) => {
  if (version === undefined) version = getHighestWalletVersion()
  switch (version) {
  case 0:
    await v0.setPrivateKey(keypair.privateKey)
    await v0.setPublicKey(keypair.publicKey)
    await v0.setPassword(password)
    await setWalletVersion(0)
    break
  case 1:
    await v1.setPrivateKey(keypair.privateKey, password)
    await v1.setPublicKey(keypair.publicKey)
    await v1.setPassword(password)
    await setWalletVersion(1)
    break
  default:
    throw invalidVersion(version)
  }
}

/**
 * Set wallet version in storage.
 *
 * @param {number} v Wallet version
 * @returns Promise<void>
 */
const setWalletVersion = v => set(KEY_WALLET_VERSION, v, store)

export {
  comparePassword,
  empty,
  expire,
  getAddress,
  getHighestWalletVersion,
  getPrivateKey,
  getPublicKey,
  getUnlockExpiry,
  getWalletVersion,
  setUnlockExpiry,
  setWallet,
  setWalletVersion,
  store
}
