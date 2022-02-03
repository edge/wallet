<template>
  <Header />
  <AccountPanel/>

  <div class="bg-gray-200 py-35">
    <div class="container">
      <StakesTable
        :hideWalletColumn="true"
        :limit="pageLimit"
        :receiveMetadata="onStakesUpdate"
        :page="currentPage"
      />
      <Pagination
        v-if="totalCount > pageLimit"
        baseRoute="Staking"
        :currentPage="currentPage"
        :limit="pageLimit"
        :totalCount="totalCount"
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
      pageLimit: 20,
      totalCount: 0
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
      return Number(this.$route.query.page) || 1
    }
  },
  methods: {
    onStakesUpdate(metadata) {
      this.totalCount = metadata.totalCount
    },
  }
}
</script>

