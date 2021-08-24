<template>
  <Header/>
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
  title() {
    return 'XE Wallet » Transactions'
  },
  data: function () {
    return {
      loading: false,
      metadata: {},
      page: 1,
      polling: null,
      transactions: [],
      wallet: {}
    }
  },
  components: {
    AccountPanel,
    Header,
    Pagination,
    TransactionsTable
  },
  mounted() {
    this.loading = true
    this.loadWallet()
    this.pollData()
  },
  methods: {
    beforeDestroy() {
      clearInterval(this.polling)
    },
    async fetchTransactions() {
      this.page = parseInt(this.$route.params.page || 1)
      
      const { transactions, metadata } = await fetchTransactions(this.wallet.address, { page: this.page })

      this.transactions = transactions
      this.metadata = metadata
      this.loading = false
    },
    fetchWallet (address) {
      return fetchWallet(address)
    },
    async loadWallet() {
      const walletAddress = await getWalletAddress()

      if (!walletAddress) {
        window.location = '/'
        return
      }

      this.wallet = await this.fetchWallet(walletAddress)
      this.fetchTransactions()
    },
    pollData() {
      this.polling = setInterval(() => {
        this.fetchTransactions()
        this.loadWallet()
      }, 10000)
    }
  }
}
</script>
