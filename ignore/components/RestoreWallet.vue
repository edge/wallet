<template>
  <div class="create-wallet">
    <h3>Restore Wallet</h3>

    <p>Paste private key:</p>
    <textarea v-model="privateKey" v-on:keyup="privateKeyOnChange()" cols="75" rows="1"></textarea>

    <div class="result">
      <p>XE Address:</p>
      <p>{{ address }}</p>

      <p>Public Key:</p>
      <p>{{ publicKey }}</p>

      <p>Private Key:</p>
      <p>{{ privateKey }}</p>
    </div>
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
  name: 'RestoreWallet',
  data() {
    return {
      privateKey: '',
      publicKey: '',
      address: ''
    }
  },
  methods: {
    privateKeyOnChange() {
      this.publicKey = privateKeyToPublicKey(this.privateKey)
      this.address = publicKeyToChecksumAddress(this.publicKey)
    }
  }
}
</script>
