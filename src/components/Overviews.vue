<template>
  <div>
    <div class="transactions-items">
      <TransactionsTable :limit="5" />
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
  }
}
</script>

<style scoped>
  .overview-items {
    /* max-width: 997px; */
    @apply mx-auto;
  }
</style>
