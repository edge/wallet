<template>
  <Header />
  <AccountPanel :wallet="this.wallet" />

  <div class="bg-gray-200 py-35">
    <div class="container">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
        <NewsPromo />
        <RecentBlocks />
      </div>

      <div class="mt-15">
        <h3>Recent transactions</h3>
        <p v-if="loading">
          Loading...
        </p>
        <p v-if="error">{{error}}</p>

        <p v-if="!loading">
          <Overviews :overviews="overviews" :transactions="transactions" />
        </p>
      </div>

      <div class="w-full text-right" v-if="transactions.length">
        <a href="/transactions" class="button button--success">View all</a>
      </div>
    </div>
  </div>
</template>

<script>
import Header from "@/components/Header"
import Overviews from "@/components/Overviews"
import AccountPanel from "@/components/AccountPanel"
import TransactionsTable from "@/components/TransactionsTable"
import NewsPromo from "@/components/NewsPromo"
import RecentBlocks from "@/components/RecentBlocks"

import { fetchTransactions, fetchWallet, formatTransactions } from '../utils/api'
import { getWalletAddress } from '../utils/wallet'

const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

export default {
  name: 'Overview',
  title() {
    return 'XE Wallet » Overview'
  },
  data: function () {
    return {
      wallet: {},
      transactions: [],
      loading: false,
      error: '',
      polling: null,
      overviews: []
    }
  },
  components: {
    AccountPanel,
    Overviews,
    TransactionsTable,
    Header,
    NewsPromo,
    RecentBlocks
  },
  mounted() {
    this.loadWallet()
    this.pollData()
  },
  methods: {
    async fetchTransactions() {
      const { transactions, metadata } = await fetchTransactions(this.wallet.address, { limit: 5 })

      // Only pick latest 10 tx.
      this.transactions = transactions.slice(0, 10)

      // TODO: use for summary view.
      // this.getTransactionSummary()

      this.metadata = metadata
      this.loading = false
    },
    getTransactionSummary() {
      const recentTxs = {}

      this.transactions.forEach(tx => {
        const date = new Date(tx.timestamp)
        const dateKey = `${date.getFullYear()}/${date.getMonth() + 1}/${date.getDate()}`

        recentTxs[dateKey] = recentTxs[dateKey] || []
        recentTxs[dateKey].push(tx)
      })

      Object.keys(recentTxs).forEach((dateKey, index) => {
        const date1 = dayjs()
        const date2 = dayjs(recentTxs[dateKey][0].timestamp)

        const currentHour = date1.hour()
        const hours = date1.diff(date2, 'hours')

        if (hours < currentHour ) {
          this.overviews.push({
            date: 'TODAY',
            items: this.formatTransactionsWithSummary(recentTxs[dateKey])
          })
        } else if (hours >= currentHour && hours < (24+currentHour)) {
          this.overviews.push({
            date: 'YESTERDAY',
            items: this.formatTransactionsWithSummary(recentTxs[dateKey])
          })
        } else {
          this.overviews.push({
            date: date2.fromNow().toUpperCase(),
            items: this.formatTransactionsWithSummary(recentTxs[dateKey])
          })
        }
      })
    },
    formatTransactionsWithSummary(transactions) {
      return transactions.map(tx => {
        return {
          head: {
            type: tx.type,
            amount: tx.amount
          },
          description: {
            type: tx.type,
            amount: tx.amount,
            date: new Date(tx.timestamp).toLocaleString(),
            address: tx.address,
            sender: tx.sender,
            recipient: tx.recipient,
            hash: tx.hash,
            description: tx.description
          }
        }
      })
    },
    fetchWallet(address) {
      return fetchWallet(address)
    },
    async loadWallet() {
      const walletAddress = await getWalletAddress()

      if (!walletAddress) {
        this.$router.push(`/`)
      }

      this.loading = true

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
