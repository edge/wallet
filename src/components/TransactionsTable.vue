<template>
  <div class="transaction-table">
    <table>
      <thead class="hidden lg:table-header-group">
        <tr>
          <th width="10%">Tx Hash</th>
          <th width="30%">From/To</th>
          <th width="20%">Memo</th>
          <th width="15%">Date</th>
          <th width="10%">Status</th>
          <th width="15%" class="amount-col">Amount XE</th>
        </tr>
      </thead>
      <tbody v-if="transactions.length">
        <TransactionsTableItem
          v-for="item in transactions"
          :key="item.hash"
          :item="item"
        />
      </tbody>
      <tbody v-else>
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
/*global process*/

import * as index from '@edge/index-utils'
// import TableHeader from '@/components/TableHeader'
import TransactionsTableItem from '@/components/TransactionsTableItem'
import { mapState } from 'vuex'

const txsRefreshInterval = 5 * 1000

export default {
  name: 'TransactionsTable',
  data: function () {
    return {
      loading: false,
      metadata: null,
      transactions: [],
      iTransactions: null
    }
  },
  components: {
    // TableHeader,
    TransactionsTableItem
  },
  props: [
    'limit',
    'page',
    'receiveMetadata'
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
    this.iStakes = setInterval(() => {
      this.updateTransactions()
    }, txsRefreshInterval)
  },
  unmounted() {
    clearInterval(this.iStakes)
  },
  methods: {
    async updateTransactions() {
      this.loading = true
      // the sort query sent to index needs to include "-created", but this is hidden from user in browser url
      const sortQuery = this.$route.query.sort ? `${this.$route.query.sort},-timestamp` : '-timestamp'
      const transactions = await index.tx.transactions(
        process.env.VUE_APP_INDEX_API_URL,
        this.address,
        {
          limit: this.limit,
          page: this.page,
          sort: sortQuery
        }
      )
      this.transactions = transactions.results
      this.receiveMetadata(transactions.metadata)
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
