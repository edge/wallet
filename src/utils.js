//                  $$\
//                  $$ |
//   $$$$$$\   $$$$$$$ | $$$$$$\   $$$$$$\
//  $$  __$$\ $$  __$$ |$$  __$$\ $$  __$$\
//  $$$$$$$$ |$$ /  $$ |$$ /  $$ |$$$$$$$$ |
//  $$   ____|$$ |  $$ |$$ |  $$ |$$   ____|
//  \$$$$$$$\ \$$$$$$$ |\$$$$$$$ |\$$$$$$$\
//   \_______| \_______| \____$$ | \_______|
//                      $$\   $$ |
// © 2021 Edge Network  \$$$$$$  |
//   Technologies Ltd.   \______/

//
// TODO: Move this to @edge/wallet-utils
//

const words = require('./words')
const SHA256 = require('crypto-js/sha256')
const keccak256 = require('js-sha3').keccak256
const elliptic = require('elliptic')
const ec = new elliptic.ec('secp256k1')

function generateKeyPair() {
  return ec.genKeyPair()
}

function phraseFromPrivateKey(privateKey) {
  const key = `${privateKey}00`
  const triplets = key.match(/.{1,3}/g)
  return triplets.map(triplet => words[parseInt(triplet, 16)]).join(' ')
}

function privateKeyFromPhrase(phrase) {
  const chunks = phrase.split(' ')
  const triplets = chunks.map(chunk => words.indexOf(chunk).toString(16).padStart(3, '0'))
  return triplets.join('').slice(0, -2)
}

function publicKeyToChecksumAddress(publicKey) {
  const hash = keccak256(publicKey)
  const addr = 'xe_' + hash.substring(hash.length - 40, hash.length)
  return generateChecksumAddress(addr)
}

function generateChecksumAddress(address) {
  const addr = address.slice(3)
  const addrHash = keccak256(addr.toLowerCase())

  let chkAddr = ''
  for (let i = 0; i < addr.length; i++) {
    if (parseInt(addrHash[i], 16) >= 8) chkAddr += addr[i].toUpperCase()
    else chkAddr += addr[i]
  }

  return `xe_${chkAddr}`
}

function privateKeyToPublicKey(privateKey) {
  return ec.keyFromPrivate(privateKey, 'hex').getPublic(true, 'hex')
}

module.exports = {
  generateKeyPair,
  phraseFromPrivateKey,
  privateKeyFromPhrase,
  publicKeyToChecksumAddress,
  generateChecksumAddress,
  privateKeyToPublicKey
}
