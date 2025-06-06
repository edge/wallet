<template>
  <div class="transaction-table">
    <table>
      <thead class="hidden lg:table-header-group">
        <tr v-if="sortable">
          <TableHeader width="165" header="Date" :sortQuery="sortQuery"
            sortParam="timestamp" :onSortingUpdate="updateSorting"
          />
          <TableHeader width="15%" header="Tx Hash" :sortQuery="sortQuery"
            sortParam="hash" :onSortingUpdate="updateSorting"
          />
          <TableHeader width="20%" header="From/To" :sortQuery="sortQuery"
            sortParam="sortAddress" :onSortingUpdate="updateSorting"
          />
          <TableHeader width="30%" header="Memo" :sortQuery="sortQuery"
            sortParam="data.memo" :onSortingUpdate="updateSorting"
          />
          <TableHeader width="10%" header="Status" :sortQuery="sortQuery"
            sortParam="block.height" :onSortingUpdate="updateSorting"
          />
          <TableHeader  class="amount-col" width="15%" header="Amount $EDGE" :sortQuery="sortQuery"
            sortParam="amount" :onSortingUpdate="updateSorting"
          />
        </tr>
        <tr v-else>
          <th width="165">Date</th>
          <th width="15%">Tx Hash</th>
          <th width="20%">From/To</th>
          <th width="30%">Memo</th>
          <th width="10%">Status</th>
          <th class="amount-col" width="15%">Amount $EDGE</th>
        </tr>
      </thead>
      <tbody v-if="transactions.length">
        <TransactionsTableItem
          v-for="item in transactions"
          :key="item.hash"
          :item="item"
        />
      </tbody>
      <tbody v-else-if="!loaded && loading">
        <td colspan="6" class="block w-full text-center bg-white lg:table-cell py-35">
          Loading...
        </td>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="6" class="block w-full text-center bg-white lg:table-cell py-35">
            No transactions.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import * as index from '@edge/index-utils'
import TableHeader from '@/components/TableHeader.vue'
import TransactionsTableItem from '@/components/TransactionsTableItem.vue'
import { mapState } from 'vuex'

const txsRefreshInterval = 5 * 1000

export default {
  name: 'TransactionsTable',
  data: function () {
    return {
      loaded: false,
      loading: false,
      metadata: null,
      transactions: [],
      iTransactions: null
    }
  },
  components: {
    TableHeader,
    TransactionsTableItem
  },
  props: [
    'limit',
    'page',
    'receiveMetadata',
    'sortable'
  ],
  computed: {
    ...mapState(['address']),
    sortQuery() {
      return this.$route.query.sort
    }
  },
  mounted() {
    this.updateTransactions()
    // initiate polling
    this.iTransactions = setInterval(() => {
      this.updateTransactions()
    }, txsRefreshInterval)
  },
  unmounted() {
    clearInterval(this.iTransactions)
  },
  methods: {
    async updateTransactions() {
      this.loading = true
      // the sort query sent to index needs to include "-created", but this is hidden from user in browser url
      const sortQuery = this.$route.query.sort ? `${this.$route.query.sort},-timestamp` : '-timestamp'
      const transactions = await index.tx.transactions(
        import.meta.env.VITE_INDEX_API_URL,
        this.address,
        {
          limit: this.limit,
          page: this.page,
          sort: sortQuery
        }
      )
      this.transactions = transactions.results
      if (this.receiveMetadata) this.receiveMetadata(transactions.metadata)
      this.loaded = true
      this.loading = false
    },
    updateSorting(newSortQuery) {
      const query = { ...this.$route.query, sort: newSortQuery }
      if (!newSortQuery) delete query.sort
      this.$router.replace({ query })
    }
  },
  watch: {
    page() {
      this.updateTransactions()
    },
    sortQuery() {
      this.updateTransactions()
    }
  }
}
</script>

<style scoped>
table {
  @apply w-full table-fixed
}

table, tbody, tr {
  @apply block;
}

th {
  @apply font-normal text-sm2 text-left text-black bg-gray-100 border-b-2 border-gray-200 py-13 px-5;
}

th:first-of-type {
  @apply pl-20;
}

th.amount-col {
  @apply text-right
}

th .icon {
  @apply w-15 inline-block align-middle text-gray-400;
}

@screen lg {
  table {
    @apply table;
  }

  tbody {
    @apply table-row-group;
  }

  tr {
    @apply table-row;
  }
}
</style>
