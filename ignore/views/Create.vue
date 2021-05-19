<template>
  <div class="create">
    <h1>Create wallet</h1>
    <router-link to="/">Back</router-link>
    <CreateWallet />
  </div>
</template>

<script>
import CreateWallet from '@/components/CreateWallet.vue'

export default {
  name: 'Create',
  metaInfo: {
    title: 'Create wallet'
  },
  components: {
    CreateWallet
  }
}
</script>
