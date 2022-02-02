<template>
  <Header />
  <AccountPanel/>

  <div class="bg-gray-200 py-35">
    <div class="container">
      <StakesTable
        :limit="pageLimit"
        :receiveMetadata="onStakesUpdate"
        :skip="skip"
      />
      <Pagination
        v-if="totalCount > pageLimit"
        baseRoute="Staking"
        :limit="pageLimit"
        :updateSkip="onPageUpdate"
        :skip="skip"
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
      pageLimit: 2,
      skip: 0,
      totalCount: 0
    }
  },
  components: {
    AccountPanel,
    Header,
    Pagination,
    StakesTable
  },
  methods: {
    onStakesUpdate(metadata) {
      this.totalCount = metadata.totalCount
    },
    onPageUpdate(skip) {
      this.skip = skip
      console.log(this.skip)
    }
  }
}
</script>

