<template>
  <div>
    <Header />
    <AccountPanel/>

    <div class="bg-gray-200 py-35">
      <div class="container">
        <div v-if="isTestnet" class="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <TestnetFaucet />
          <RecentBlocks />
        </div>
        <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-24 items-center">
          <NewsPromo />
          <RecentBlocks />
        </div>

        <div class="mt-35">
          <h3>Recent transactions</h3>
          <p v-if="error">{{error}}</p>

          <Overviews :overviews="overviews" :transactions="transactions" />
        </div>

        <div class="w-full text-right mt-20" v-if="transactions.length">
          <router-link to="/transactions" class="button button--success">View all</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AccountPanel from '@/components/AccountPanel.vue'
import Header from '@/components/Header.vue'
import NewsPromo from '@/components/NewsPromo.vue'
import Overviews from '@/components/Overviews.vue'
import RecentBlocks from '@/components/RecentBlocks.vue'
import TestnetFaucet from '@/components/Faucet.vue'
import dayjs from 'dayjs'
import { fetchTransactions } from '../utils/api'
import { mapState } from 'vuex'
import relativeTime from 'dayjs/plugin/relativeTime'

dayjs.extend(relativeTime)

const txCache = {}

export default {
  name: 'ViewOverview',
  title: 'Overview',
  data: function () {
    return {
      transactions: [],
      loading: true,
      error: '',
      polling: null,
      overviews: [],
      transactionRefreshInterval: 5000,
      isTestnet: import.meta.env.VITE_IS_TESTNET === 'true'
    }
  },
  components: {
    AccountPanel,
    Overviews,
    Header,
    NewsPromo,
    RecentBlocks,
    TestnetFaucet
  },
  computed: mapState(['address']),
  watch: {
    address(newAddr) {
      const cached = txCache[newAddr]
      if (cached) {
        this.transactions = cached.transactions
        this.metadata = cached.metadata
      } else {
        this.transactions = []
      }
      this.updateTransactions()
    }
  },
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
      const addr = this.address
      if (!addr) return
      const { transactions, metadata } = await fetchTransactions(addr, { limit: 5 })

      txCache[addr] = { transactions, metadata }
      // Only update display if address hasn't changed during fetch
      if (this.address === addr) {
        this.transactions = transactions
        this.metadata = metadata
        this.loading = false
      }
    },
    pollData() {
      this.polling = setInterval(() => {
        this.updateTransactions()
      }, this.transactionRefreshInterval)
    }
  }
}
</script>
