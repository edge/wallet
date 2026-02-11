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

          <Overviews />
        </div>

        <div class="w-full text-right mt-20">
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
export default {
  name: 'ViewOverview',
  title: 'Overview',
  data: function () {
    return {
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
  }
}
</script>
