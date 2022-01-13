import { publicKeyToChecksumAddress } from '@edge/wallet-utils'
import { clear, createStore, get, getMany, set, setMany } from 'idb-keyval'
import { compare, createSalt, decrypt, encrypt, hash } from '../crypto'

// v0 (legacy) wallet storage uses a fixed secret key.
// This value is preserved solely to support automatic migration to >=v1.
// It should not be used anywhere else.
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'

const store = createStore('edge', 'wallet')

const comparePassword = async password => {
  const [hash, salt] = await getMany(['h', 's'], store)
  return compare(hash, salt, password)
}

const empty = () => clear(store)

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
  empty,
  getAddress,
  getPublicKey,
  getPrivateKey,
  hasWallet,
  setPublicKey,
  setPassword,
  setPrivateKey
}
