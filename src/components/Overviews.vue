<template>
  <div class="overview-items" v-if="overviews">
    <OverviewItem
      v-for="(item, index) in overviews"
      :key="index"
      :setting="item" />
  </div>

  <div class="transactions-items" v-if="transactions">
    <TransactionsTable :transactions="transactions"/>
  </div>
</template>

<script>
import OverviewItem from "@/components/OverviewItem"
import Pagination from "@/components/Pagination"
import TransactionsTable from "@/components/TransactionsTable"

export default {
  name: "Overviews",
  components: {
    OverviewItem,
    Pagination,
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