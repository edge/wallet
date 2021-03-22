<template>
  <div class="create-wallet">
    <h3>Restore Wallet</h3>

    <p>Paste private key:</p>
    <textarea v-model="privateKey" v-on:keyup="privateKeyOnChange()" cols="75" rows="1"></textarea>

    <p>Paste phrase:</p>
    <textarea v-model="phrase" v-on:keyup="phraseOnChange()" cols="75" rows="2"></textarea>

    <div class="result">
      <p>XE Address:</p>
      <p class="formatted">{{ address }}</p>

      <p>Public Key:</p>
      <p class="formatted">{{ publicKey }}</p>

      <p>Private Key:</p>
      <p class="formatted">{{ privateKey }}</p>

      <p>Private Key Phrase:</p>
      <p class="formatted">{{ phrase }}</p>
    </div>
  </div>
</template>

<style scoped>
div.result {
  width: 50%;
  margin: 40px auto;
  padding: 10px;
  border: 1px solid #eee;
}
div.result p {
  width: 100%;
}
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
textarea {
  text-align: center;
  font-family: monospace;
  border: 1px solid #aaa;
  border-radius: 5px;
  padding: 20px 0;
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
  name: 'RestoreWallet',
  data() {
    return {
      privateKey: '',
      publicKey: '',
      address: '',
      phrase: ''
    }
  },
  methods: {
    privateKeyOnChange() {
      const phrase = phraseFromPrivateKey(this.privateKey)
      const firstLine = phrase.split(' ').slice(0, 11).join(' ')
      const secondLine = phrase.split(' ').slice(11).join(' ')
      this.phrase = this.inputPhrase = `${firstLine}\n${secondLine}`
      this.publicKey = privateKeyToPublicKey(this.privateKey)
      this.address = publicKeyToChecksumAddress(this.publicKey)
    },
    phraseOnChange() {
      const trimmedPhrase = this.phrase.replace('\n', ' ')
      this.privateKey = privateKeyFromPhrase(trimmedPhrase)
      this.publicKey = privateKeyToPublicKey(this.privateKey)
      this.address = publicKeyToChecksumAddress(this.publicKey)
    }
  }
}
</script>
