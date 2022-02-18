<template>
  <span class="flex w-full overflow-hidden text-white overflow-ellipsis">
    <a
      class="text-lg text-w hite underline w-max-full overflow-hidden overflow-ellipsis"
      :href="url"
      target="_blank"
    >
      {{ truncated ? shortHash : hash }}
    </a>
    <!-- eslint-disable-next-line max-len -->
    <svg class="w-20 h-20 mt-2 ml-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
  </span>
</template>

<script>
/*global process*/

const explorerUrl = process.env.VUE_APP_EXPLORER_URL
const etherscanUrl = process.env.VUE_APP_IS_TESTNET ? 'https://rinkeby.etherscan.io' : 'https://etherscan.io'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'HashLink',
  props: {
    stake: String,
    to: String,
    transaction: String,
    truncated: Boolean,
    wallet: String
  },
  computed: {
    hash() {
      return this.transaction || this.stake || this.wallet || null
    },
    shortHash() {
      if (this.hash === null) return ''
      return [
        this.hash.substring(0, 6),
        this.hash.substring(this.hash.length - 4)
      ].join('...')
    },
    hashType() {
      if (this.transaction) return this.to === 'explorer' ? 'transaction' : 'tx'
      if (this.wallet) return this.to === 'explorer' ? 'wallet' : 'address'
      if (this.stake) return this.to === 'explorer' ? 'stake' : null
      return null
    },
    url() {
      if (this.to === 'explorer') return `${explorerUrl}/${this.hashType}/${this.hash}`
      if (this.to === 'etherscan') return `${etherscanUrl}/${this.hashType}/${this.hash}`
      return ''
    }
  }
}
</script>
