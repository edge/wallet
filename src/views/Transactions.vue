<template>
  <Header/>
  <AccountPanel :wallet="this.wallet" />

  <div class="bg-gray-200 py-35">
    <div class="container">
      <TransactionsTable :transactions="transactions"/>
    </div>
  </div>
</template>

<script>

import Header from "@/components/Header"
import TableItem from "@/components/TransactionsTableItem"
import TransactionsTable from "@/components/TransactionsTable"
import AccountPanel from "@/components/AccountPanel"

import { fetchTransactions, fetchWallet } from '../utils/api'
import { getWalletAddress } from '../utils/wallet'

export default {
  name: 'Transactions',
  data: function () {
    return {
      loading: false,
      metadata: {},
      transactions: [],
      wallet: {}
    }
  },
  components: {
    AccountPanel,
    TransactionsTable,
    TableItem,
    Header
  },
  mounted () {
    this.loadWallet()
  },
  methods: {
    async fetchTransactions () {
      const { transactions, metadata } = await fetchTransactions(this.wallet.address)

      this.transactions = transactions
      this.metadata = metadata  
      this.loading = false
    },
    fetchWallet (address) {
      return fetchWallet(address)
    },
    async loadWallet () {
      this.loading = true

      const walletAddress = await getWalletAddress()
      this.wallet = await this.fetchWallet(walletAddress)
      this.fetchTransactions()
    }
  },
  title() {
    return 'XE Wallet » Transactions'
  }
}
</script>
