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
      const { transactions, metadata } = await fetchTransactions(this.address, { limit: 5 })

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
