<template>
  <Header />
  <AccountPanel/>

  <div class="bg-gray-200 py-35">
    <div class="container">
      <StakesTable
        :page="page"
        :totalPages="totalPages"
        :stakes="stakes"
      />
    </div>
  </div>
</template>

<script>
import * as index from '@edge/index-utils'
import AccountPanel from '@/components/AccountPanel'
import Header from '@/components/Header'
import StakesTable from '@/components/StakesTable'
import { mapState } from 'vuex'

export default {
  name: 'Staking',
  data: function () {
    return {
      loading: false,
      metadata: null,
      page: 1,
      pageLimit: 20,
      polling: null,
      stakes: [],
      stakesRefreshInterval: 5000,
      totalPages: 1,
    }
  },
  props: [],
  components: {
    AccountPanel,
    Header,
    StakesTable
  },
  computed: mapState(['address']),
  mounted() {
    this.getStakes()
    this.pollStakes()
  },
  unmounted() {
    clearInterval(this.polling)
  },
  methods: {
    async getStakes() {
      this.loading = true
      const stakes = await index.stake.stakes(
        process.env.VUE_APP_INDEX_API_URL,
        this.address,
        { skip: (this.page - 1) * this.pageLimit, limit: this.pageLimit }
      )
      this.stakes = stakes.results
      this.metadata = stakes.metadata
      this.totalPages = Math.ceil(stakes.metadata.count / pageLimit)
      this.loading = false
    },
    pollStakes() {
      this.polling = setInterval(() => {
        this.getStakes()
      }, this.stakesRefreshInterval)
    }
  }
}
</script>

