import { compare, decrypt, encrypt, getHash, getSalt } from '../utils/crypto'
import { get, set } from '../utils/db'

const {
  generateSignature,
  publicKeyToChecksumAddress,
  toMicroXe,
  xeStringFromMicroXe
} = require('@edge/wallet-utils')

const createTransaction = async (amount, memo, nonce, recipient) => {
  const walletAddress = await getWalletAddress()
  const tx = {
    timestamp: Date.now(),
    sender: walletAddress,
    recipient,
    amount: toMicroXe(amount),
    data: {
      memo
    },
    nonce
  }

  const privateKey = await get('p2')

  tx.signature = generateSignature(decrypt(privateKey), JSON.stringify(tx))

  return tx
}

const getWalletAddress = async () => {
  const p1 = await get('p1')

  if (!p1) {
    return false
  }

  const publicKey = decrypt(p1)

  return publicKeyToChecksumAddress(publicKey)
}

const hasExistingWallet = () => {
  return get('p1')
    .then(publicKey => {
      return typeof publicKey !== 'undefined'
    })
}

const storePassword = async input => {
  const salt = getSalt()
  const hash = getHash(input, salt)
  await set('s', salt)
  await set('h', hash)

  return true
}

const storePrivateKey = async input => {
  await set('p2', encrypt(input))

  return true
}

const storePublicKey = async input => {
  await set('p1', encrypt(input))

  return true
}

const validatePassword = async input => {
  const [hash, salt] = await get(['h', 's'])

  return compare(hash, salt, input)
}

export {
  createTransaction,
  getWalletAddress,
  hasExistingWallet,
  storePassword,
  storePrivateKey,
  storePublicKey,
  validatePassword
}
