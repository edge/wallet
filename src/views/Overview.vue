<template>
  <Header />
  <AccountPanel :wallet="this.wallet" />

  <div class="bg-gray-200 py-35">
    <div class="container">
      <p v-if="loading">
        Loading...
      </p>
      <p v-if="error">{{error}}</p>

      <p v-if="!loading">
        <Overviews :overviews="overviews"/>
      </p>
    </div>
  </div>
</template>

<script>

import Header from "@/components/Header"
import Overviews from "@/components/Overviews"
import AccountPanel from "@/components/AccountPanel"
import TransactionsTable from "@/components/TransactionsTable"

import { fetchTransactions, fetchWallet } from '../utils/api'
import { getWalletAddress } from '../utils/wallet'

const dayjs = require('dayjs')
const relativeTime = require('dayjs/plugin/relativeTime')
dayjs.extend(relativeTime)

export default {
  name: 'Overview',
  data: function () {
    return {
      wallet: {},
      transactions: [],
      pendingTransactions: [],
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
    Header
  },
  mounted () {
    this.loadWallet()
    this.pollData()
  },
  methods: {
    async fetchTransactions () {
      const { transactions, metadata } = await fetchTransactions(this.wallet.address)

      this.transactions = transactions

      const recentTxs = {}

      transactions.forEach(tx => {
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
            items: this.formatTransactions(recentTxs[dateKey])
          })
        } else if (hours >= currentHour && hours < (24+currentHour)) {
          this.overviews.push({
            date: 'YESTERDAY',
            items: this.formatTransactions(recentTxs[dateKey])
          })
        } else {
          this.overviews.push({
            date: date2.fromNow().toUpperCase(),
            items: this.formatTransactions(recentTxs[dateKey])
          })
        }
      })

      this.metadata = metadata
      this.loading = false
    },
    formatTransactions (transactions) {
      return transactions.map(tx => {
        return {
          head: {
            type: tx.type,
            amount: tx.amount
          },
          description: {
            date: new Date(tx.timestamp).toLocaleString(), //'16/04/2021 13:06',
            address: tx.address,
            sender: tx.sender,
            recipient: tx.recipient,
            id: tx.hash,
            description: tx.description,
          }
        }
      })
    },
    fetchPendingTransactions() {

    },
    pollData () {
		  // this.polling = setInterval(() => {
			  // this.fetchPendingTransactions()
		  // }, 10000)
	  },
    beforeDestroy () {
      // clearInterval(this.polling)
    },
    fetchWallet (address) {
      return fetchWallet(address)
    },
    async loadWallet () {
      this.loading = true

      const walletAddress = await getWalletAddress()
      
      if (!walletAddress) {
        window.location = '/'
        return
      }

      this.wallet = await this.fetchWallet(walletAddress)
      this.fetchTransactions()
    }
  }
}
</script>
