<template>
  <div>
    <Header />
    <AccountPanel/>

    <div class="bg-gray-200 py-35">
      <div class="container">
        <TransactionsTable :transactions="transactions"/>
        <Pagination
          v-if="transactions.length"
          baseRoute="Transactions"
          :currentPage="page"
          :totalPages="Math.ceil(metadata.totalCount/metadata.limit)"
        />
      </div>
    </div>
  </div>
</template>

<script>
import AccountPanel from '@/components/AccountPanel'
import Header from '@/components/Header'
import Pagination from '@/components/Pagination'
import TransactionsTable from '@/components/TransactionsTable'
import { fetchTransactions } from '../utils/api'
import { mapState } from 'vuex'

export default {
  name: 'ViewTransactions',
  title: 'Transactions',
  data: function () {
    return {
      loading: true,
      metadata: {},
      page: 1,
      polling: null,
      transactions: [],
      transactionRefreshInterval: 5000
    }
  },
  components: {
    AccountPanel,
    Header,
    Pagination,
    TransactionsTable
  },
  computed: mapState(['address']),
  mounted() {
    this.initialise()
  },
  unmounted() {
    clearInterval(this.polling)
  },
  methods: {
    async initialise() {
      await this.updateTransactions()
      this.pollData()
    },
    async updateTransactions() {
      this.page = parseInt(this.$route.params.page || 1)
      const { transactions, metadata } = await fetchTransactions(this.address, { page: this.page })

      // Update this.transactions & this.metadata only once promise has resolved
      this.transactions = transactions
      this.metadata = metadata
      this.loading = false
    },
    pollData() {
      this.polling = setInterval(() => {
        this.updateTransactions()
      }, this.transactionRefreshInterval)
    }
  }
}
</script>
