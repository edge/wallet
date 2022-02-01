<template>
  <div class="transaction-table">
    <table>
      <thead class="hidden lg:table-header-group">
        <tr>
          <th width="23%">ID</th>
          <th width="23%">Hash</th>
          <th width="23%">Device</th>
          <th width="8%">Type</th>
          <th width="8%">Status</th>
          <th width="15%">Amount XE</th>
        </tr>
      </thead>
      <tbody v-if="stakes.length">
        <StakesTableItem  v-for="item in stakes" :key="item.id" :item="item"/>
      </tbody>
      <tbody v-if="!stakes.length">
        <tr>
          <td colspan="7" class="block w-full text-center bg-white lg:table-cell py-35">
            No stakes.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import StakesTableItem from "@/components/StakesTableItem"

export default {
  name: "StakesTable",
  components: {StakesTableItem},
  props: ['page', 'totalPages', 'stakes']
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
