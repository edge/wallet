<template>
  <div class="create-wallet">
    <h3>Create Wallet</h3>

    <button v-on:click="generate()">Generate new wallet</button>

    <p>XE Address:</p>
    <p class="formatted">{{ address }}</p>

    <p>Public Key:</p>
    <p class="formatted">{{ publicKey }}</p>

    <p>Private Key:</p>
    <p class="formatted">{{ privateKey }}</p>

    <p>Private Key Phrase:</p>
    <p class="formatted">{{ phrase }}</p>
  </div>
</template>

<style scoped>
p {
  margin: 10px auto;
  padding: 10px;
  width: 50%;
  word-wrap: break-word;
}
p.formatted {
  background: #eee;
  border: 1px solid #aaa;
  border-radius: 5px;
  font-family: monospace;
  white-space: pre-wrap;
}
button {
  padding: 10px 20px;
}
</style>

<script>
const {
  generateKeyPair,
  phraseFromPrivateKey,
  privateKeyFromPhrase,
  publicKeyToChecksumAddress,
  generateChecksumAddress,
  privateKeyToPublicKey
} = require('@edge/wallet-utils')

export default {
  name: 'CreateWallet',
  data() {
    return {
      privateKey: '',
      publicKey: '',
      address: '',
      phrase: ''
    }
  },
  mounted () {
    this.generate()
  },
  methods: {
    generate() {
      const keyPair = generateKeyPair()
      this.privateKey = keyPair.getPrivate('hex').toString()
      this.publicKey = keyPair.getPublic(true, 'hex').toString()
      this.address = publicKeyToChecksumAddress(this.publicKey)

      const phrase = phraseFromPrivateKey(this.privateKey)
      const firstLine = phrase.split(' ').slice(0, 11).join(' ')
      const secondLine = phrase.split(' ').slice(11).join(' ')
      this.phrase = `${firstLine}\n${secondLine}`
    }
  }
}
</script>
