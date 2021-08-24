<template>
  <div class="transaction-table">
    <table>
      <thead class="hidden lg:table-header-group">
      <tr>
        <th width="10%">Tx Hash</th>
        <th width="12%">Date</th>
        <th width="33%">From/To</th>
        <th width="16%">Memo</th>
        <th width="12%">Status</th>
        <th width="20%">Amount</th>
      </tr>
      </thead>
      <tbody v-if="transactions.length">
        <tr v-for="item in transactions" :key="item.id" :class="item.pending ? 'italic text-gray-400' : ''">
          <TransactionsTableItem :item="item"/>
        </tr>
      </tbody>
      <tbody v-if="!transactions.length">
        <tr>
          <td colspan="7" class="block w-full text-center bg-white lg:table-cell py-35">
            No transactions.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import TransactionsTableItem from "@/components/TransactionsTableItem"

export default {
  name: "TransactionsTable",
  components: {TransactionsTableItem},
  props: ['transactions'],
  methods: {
  }
}
</script>

<style scoped>
table, tbody, tr {
  @apply block;
}

th {
  @apply font-normal text-sm2 text-left text-black bg-gray-100 border-b-2 border-gray-200;
}

th:last-child {
  @apply rounded-r-4 text-right;
}

@screen lg {
  tbody {
    @apply table-row-group;
  }

  table {
    @apply table;
  }

  tr {
    @apply table-row;
  }
}
</style>
