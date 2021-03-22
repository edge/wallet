<template>
  <div class="restore">
    <h1>Restore wallet</h1>
    <RestoreWallet />
  </div>
</template>

<script>
import RestoreWallet from '@/components/RestoreWallet.vue'

export default {
  name: 'Restore',
  metaInfo: {
    title: 'Restore wallet'
  },
  components: {
    RestoreWallet
  }
}
</script>
