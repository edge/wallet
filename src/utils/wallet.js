import { decrypt } from '../utils/crypto'
import { get } from '../utils/db'

const {
  publicKeyToChecksumAddress,
  xeStringFromMicroXe
} = require('@edge/wallet-utils')

const getWalletAddress = async () => {
  const [p1] = await get(['p1'])
  const publicKey = decrypt(p1)

  return publicKeyToChecksumAddress(publicKey)
}

export {
  getWalletAddress
}
