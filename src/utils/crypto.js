const crypto = require('crypto')

const algorithm = 'aes-256-ctr'
const secretKey = 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'
const iv = crypto.randomBytes(16)

const encrypt = text => {
  const cipher = crypto.createCipheriv(algorithm, secretKey, iv)
  const encrypted = Buffer.concat([cipher.update(text), cipher.final()])

  return {
    iv: iv.toString('hex'),
    content: encrypted.toString('hex')
  }
}

const decrypt = hash => {
  const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(hash.iv, 'hex'))
  const decrpyted = Buffer.concat([decipher.update(Buffer.from(hash.content, 'hex')), decipher.final()])

  return decrpyted.toString()
}

const getHash = (input, salt) => {
  return crypto
    .pbkdf2Sync(input, salt, 1000, 64, 'sha512')
    .toString('hex')
}

const getSalt = () => {
  return crypto.randomBytes(16).toString('hex')
}

const compare = (hash, salt, input) => {
  const inputHash = crypto
    .pbkdf2Sync(input, salt, 1000, 64, 'sha512')
    .toString('hex')
  return hash === inputHash
}

module.exports = {
  compare,
  decrypt,
  encrypt,
  getHash,
  getSalt
}
