<template>
  <div>
    <div class="overview-items" v-if="overviews">
      <OverviewItem
        v-for="(item, index) in overviews"
        :key="index"
        :setting="item" />
    </div>

    <div class="transactions-items" v-if="transactions">
      <TransactionsTable :transactions="transactions" :limit="5" />
    </div>
  </div>
</template>

<script>
import OverviewItem from '@/components/OverviewItem'
import TransactionsTable from '@/components/TransactionsTable'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Overviews',
  components: {
    OverviewItem,
    TransactionsTable
  },
  props: ['overviews', 'transactions'],
  methods: {
  }
}
</script>

<style scoped>
  .overview-items {
    /* max-width: 997px; */
    @apply mx-auto;
  }
</style>
