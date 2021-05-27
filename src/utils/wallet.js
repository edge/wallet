import { decrypt } from '../utils/crypto'
import { get } from '../utils/db'

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
  const [p1] = await get(['p1'])
  const publicKey = decrypt(p1)

  return publicKeyToChecksumAddress(publicKey)
}

export {
  createTransaction,
  getWalletAddress
}
