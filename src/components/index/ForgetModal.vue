<template>
  <Modal :close="close" :visible="visible">
    <template v-slot:header>
      <h2>Forget wallet</h2>
    </template>

    <template v-slot:body>
      <p>This will remove your wallet from this browser.</p>
      <p>Make sure you have backed up your private key, otherwise you may lose any funds in your wallet.</p>
    </template>

    <template v-slot:footer>
      <div class="grid grid-cols-1 gap-24 px-24 pt-24 border-gray-700 border-solid md:grid-cols-2 border-t-default border-opacity-30 pb-24">
        <button class="w-full button button--outline-success" @click="cancel">Cancel</button>
        <button class="w-full button button--success border-red-600 bg-red-600 hover:border-red-800 hover:bg-red-800" @click="forget">Forget wallet</button>
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from '../Modal.vue'

export default {
  name: 'ForgetWallet',
  components: {
    Modal,
  },
  props: {
    close: Function,
    afterForget: Function,
    visible: Boolean
  },
  methods: {
    cancel() {
      this.close()
    },
    async forget() {
      this.$store.dispatch('forget')
      this.afterForget()
    }
  }
}
</script>
