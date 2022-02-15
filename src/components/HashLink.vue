<template>
  <span class="flex w-full overflow-hidden text-white overflow-ellipsis">
    <a
      class="text-lg text-white underline w-max-full overflow-hidden overflow-ellipsis"
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

const etherscanUrls = {
  '0x1': 'https://etherscan.io',
  '0x4': 'https://rinkeby.etherscan.io'
}

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'HashLink',
  props: {
    chainId: String,
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
      if (this.transaction) return 'transaction'
      else if (this.stake) return 'stake'
      else if (this.wallet) return 'wallet'
      else return ''
    },
    url() {
      switch (this.to) {
      case 'explorer':
        return `${explorerUrl}/${this.hashType}/${this.hash}`
      case 'etherscan':
        return `${etherscanUrls[this.chainId]}/tx/${this.hash}`
      default:
        return ''
      }
    }
  }
}
</script>
