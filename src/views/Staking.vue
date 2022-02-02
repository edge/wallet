<template>
  <Header />
  <AccountPanel/>

  <div class="bg-gray-200 py-35">
    <div class="container">
      <StakesTable
        :limit="pageLimit"
        :skip="skip"
      />
    </div>
  </div>
</template>

<script>
import AccountPanel from '@/components/AccountPanel'
import Header from '@/components/Header'
import StakesTable from '@/components/StakesTable'

export default {
  name: 'Staking',
  data: function () {
    return {
      pageLimit: 20,
      skip: 0,
    }
  },
  components: {
    AccountPanel,
    Header,
    StakesTable
  }
}
</script>

