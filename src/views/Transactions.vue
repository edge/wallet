<template>
  <Header />
  <AccountPanel :wallet="this.wallet" />

  <div class="bg-gray-200 py-35">
    <div class="container">
      <TransactionsTable :transactions="transactions"/>
      <Pagination v-if="transactions.length" baseRoute="Transactions" :currentPage="page" :totalPages="Math.ceil(metadata.totalCount/metadata.limit)" />
    </div>
  </div>
</template>

<script>
import AccountPanel from "@/components/AccountPanel"
import Header from "@/components/Header"
import TransactionsTable from "@/components/TransactionsTable"
import Pagination from "@/components/Pagination"

import { fetchTransactions, fetchWallet } from '../utils/api'
import { getWalletAddress } from '../utils/wallet'

export default {
  name: 'Transactions',
  title: 'Transactions',
  data: function () {
    return {
      loading: true,
      metadata: {},
      page: 1,
      polling: null,
      transactions: [],
      wallet: {},
      transactionRefreshInterval: 5000
    }
  },
  components: {
    AccountPanel,
    Header,
    Pagination,
    TransactionsTable
  },
  mounted() {
    this.initialise()
  },
  unmounted() {
    clearInterval(this.polling)
  },
  methods: {
    async initialise() {
      await this.updateWallet()
      await this.updateTransactions()
      this.pollData()
    },
    async updateWallet() {
      const walletAddress = await getWalletAddress()
      if (!walletAddress) this.$router.push(`/`)

      const wallet = await fetchWallet(walletAddress)

      // Update this.wallet only once promise has resolved
      this.wallet = wallet
    },
    async updateTransactions() {
      this.page = parseInt(this.$route.params.page || 1)
      const { transactions, metadata } = await fetchTransactions(this.wallet.address, { page: this.page })

      // Update this.transactions & this.metadata only once promise has resolved
      this.transactions = transactions
      this.metadata = metadata
      this.loading = false
    },
    pollData() {
      this.polling = setInterval(() => {
        this.updateWallet()
        this.updateTransactions()
      }, this.transactionRefreshInterval)
    }
  }
}
</script>
