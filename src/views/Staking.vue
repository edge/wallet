<template>
  <Header />
  <AccountPanel/>

  <div class="bg-gray-200 py-35">
    <div class="container">
      <StakesTable
        :hideWalletColumn="true"
        :limit="limit"
        :receiveMetadata="onStakesUpdate"
        :page="currentPage"
      />
      <Pagination
        v-if="totalCount > limit"
        baseRoute="Staking"
        :currentPage="currentPage"
        :limit="limit"
        :totalCount="metadata.totalCount"
      />
    </div>
  </div>
</template>

<script>
import AccountPanel from '@/components/AccountPanel'
import Header from '@/components/Header'
import Pagination from '@/components/PaginationNew'
import StakesTable from '@/components/StakesTable'

export default {
  name: 'Staking',
  data: function () {
    return {
      metadata: null,
      limit: 20,
    }
  },
  components: {
    AccountPanel,
    Header,
    Pagination,
    StakesTable
  },
  computed: {
    currentPage() {
      return parseInt(this.$route.query.page) || 1
    },
  },
  methods: {
    onStakesUpdate(metadata) {
      this.metadata = metadata
    },
  }
}
</script>

