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
      metadata: { totalCount: 0 },
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
      return Math.max(1, parseInt(this.$route.query.page) || 1)
    },
    lastPage() {
      return Math.max(1, Math.ceil(this.metadata.totalCount / this.limit))
    }
  },
  methods: {
    onStakesUpdate(metadata) {
      this.metadata = metadata
    }
  },
  watch: {
    metadata() {
      // clamp pagination to available page numbers with automatic redirection
      if (this.currentPage > this.lastPage) this.$router.push({ name: 'Staking', query: { page: this.lastPage } })
    }
  },
  mounted() {
    const p = parseInt(this.$route.query.page) || 0
    if (p < 1) this.$router.push({ name: 'Staking', query: { page: 1 } })
  }
}
</script>

