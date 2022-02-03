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
        v-if="metadata.totalCount > limit"
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
      metadata: {totalCount: 0},
      limit: 5,
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
      const currentPage = this.clampPageNumber(parseInt(this.$route.query.page) || 1)
      return currentPage
    },
    lastPage() {
      return this.metadata.totalCount ? Math.ceil(this.metadata.totalCount / this.limit) : 1
    }
  },
  methods: {
    clampPageNumber(page) {
      const clampedPageNumber = Math.min(Math.max(page, 1), this.lastPage)
      // redirect to correct page number
      this.$router.push({ name: 'Staking', query: { page: clampedPageNumber } })
      return clampedPageNumber
    },
    onStakesUpdate(metadata) {
      this.metadata = metadata
    },
  }
}
</script>

