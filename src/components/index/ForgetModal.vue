<template>
  <Modal :close="cancel" :visible="visible">
    <template v-slot:header>
      <h2>{{ wallet ? 'Remove wallet' : forgetTitle }}</h2>
    </template>

    <template v-slot:body>
      <div v-if="wallet">
        <p class="mb-8"><strong>{{ wallet.name || 'Unnamed wallet' }}</strong></p>
        <p class="font-mono text-sm text-gray-400 break-all mb-16">{{ wallet.address }}</p>
        <p>This will remove this wallet from your browser.</p>
        <p>Make sure you have backed up your private key, otherwise you may lose any funds in this wallet.</p>
      </div>
      <div v-else>
        <p>This will remove all wallets from this browser.</p>
        <p>Make sure you have backed up your private keys, otherwise you may lose any funds in your wallets.</p>
      </div>
    </template>

    <template v-slot:footer>
      <div class="grid grid-cols-1 gap-24 px-24 pt-24 border-gray-700 border-solid md:grid-cols-2 border-t-default border-opacity-30 pb-24">
        <button class="w-full button button--outline-success" @click="cancel">Cancel</button>
        <button class="w-full button button--success border-red-600 bg-red-600 hover:border-red-800 hover:bg-red-800" @click="forget">{{ wallet ? 'Remove wallet' : forgetTitle }}</button>
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from '../Modal.vue'
import { mapState } from 'vuex'

export default {
  name: 'ForgetWallet',
  components: {
    Modal
  },
  props: {
    close: Function,
    afterForget: Function,
    visible: Boolean,
    wallet: Object // Optional: specific wallet to remove. If not provided, forgets everything.
  },
  emits: ['removed'],
  computed: {
    ...mapState(['sessionPassword', 'wallets']),
    hasMultipleWallets() {
      return this.wallets.length > 1
    },
    forgetTitle() {
      return this.hasMultipleWallets ? 'Reset all wallets' : 'Reset wallet'
    }
  },
  methods: {
    cancel() {
      this.close()
    },
    async forget() {
      if (this.wallet) {
        // Remove specific wallet
        await this.$store.dispatch('removeWallet', {
          walletId: this.wallet.id,
          password: this.sessionPassword
        })
        this.$emit('removed')
      } else {
        // Forget everything
        this.$store.dispatch('forget')
        this.afterForget()
      }
    }
  }
}
</script>
