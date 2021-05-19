<template>
  <div class="transaction-table">
    <table>
      <thead class="hidden lg:table-header-group">
      <tr>
        <th>Type
        </th>
        <th>Time</th>
        <th>Address</th>
        <th>Transaction ID</th>
        <th>Memo</th>
        <th>
          Amount
        </th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="item in transactions" :key="item.id">
        <TransactionsTableItem :type="item.type" :date="item.date" :id="item.id" :address="item.address"
                               :description="item.description" :amount="item.amount"/>
      </tr>
      </tbody>
    </table>
    <Pagination />
  </div>
</template>

<script>
import TransactionsTableItem from "@/components/TransactionsTableItem";
import Pagination from "@/components/Pagination";

export default {
  name: "TransactionsTable",
  components: {Pagination, TransactionsTableItem},
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