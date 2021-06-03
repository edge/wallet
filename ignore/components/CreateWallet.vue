<template>
  <div>
    <h3>Create Wallet</h3>

    <button v-on:click="generate()">Generate new wallet</button>

    <p>XE Address:</p>
    <p>{{ address }}</p>

    <p>Public Key:</p>
    <p>{{ publicKey }}</p>

    <p>Private Key:</p>
    <p>{{ privateKey }}</p>
  </div>
</template>

<script>
const {
  generateKeyPair,
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
      address: ''
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
    }
  }
}
</script>
