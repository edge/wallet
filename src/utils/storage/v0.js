// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

import { publicKeyToChecksumAddress } from '@edge/wallet-utils'
import { store } from './'
import { compare, createSalt, decrypt, encrypt, hash } from '../crypto'
import { get, getMany, set, setMany } from 'idb-keyval'

// v0 (legacy) wallet storage uses a fixed secret key.
// This value is preserved solely to support automatic migration to >=v1.
// It should not be used anywhere else.
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'

const comparePassword = async password => {
  const [hash, salt] = await getMany(['h', 's'], store)
  return compare(hash, salt, password)
}

const getAddress = async () => {
  const publicKey = await getPublicKey()
  return publicKeyToChecksumAddress(publicKey)
}

const getPrivateKey = async () => {
  const enc = await get('p2', store)
  if (enc === undefined) return undefined
  return decrypt(enc, secretKey)
}

const getPublicKey = async () => {
  const enc = await get('p1', store)
  if (enc === undefined) return undefined
  return decrypt(enc, secretKey)
}

const hasWallet = async () => {
  const encPublicKey = await get('p1', store)
  return encPublicKey !== undefined
}

const setPassword = password => {
  const s = createSalt()
  const h = hash(password, s)
  return setMany([
    ['s', s],
    ['h', h]
  ], store)
}

const setPrivateKey = key => set('p2', encrypt(key, secretKey), store)
const setPublicKey = key => set('p1', encrypt(key, secretKey), store)

export {
  comparePassword,
  getAddress,
  getPublicKey,
  getPrivateKey,
  hasWallet,
  setPublicKey,
  setPassword,
  setPrivateKey
}
