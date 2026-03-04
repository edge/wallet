<template>
  <div>
    <div class="transactions-items">
      <TransactionsTable :limit="5" :receiveMetadata="receiveMetadata" />
    </div>
  </div>
</template>

<script>
import TransactionsTable from '@/components/TransactionsTable.vue'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Overviews',
  components: {
    TransactionsTable
  },
  props: ['receiveMetadata']
}
</script>

<style scoped>
  .overview-items {
    /* max-width: 997px; */
    @apply mx-auto;
  }
</style>
