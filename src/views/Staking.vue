<template>
  <div>
    <Header />
    <AccountPanel view="staking" />

    <UnlockStakeModal
      :close="closeUnlockStakeModal"
      :visible="showUnlockStakeModal"
      :stake="stakeToUnlock"
    />

    <div class="bg-gray-200 py-35">
      <div class="container">
        <StakesTable
          :hideWalletColumn="false"
          :limit="limit"
          :receiveMetadata="onStakesUpdate"
          :page="currentPage"
          :openUnlockStakeModal="openUnlockStakeModal"
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
  </div>
</template>

<script>
import AccountPanel from '@/components/AccountPanel'
import Header from '@/components/Header'
import Pagination from '@/components/PaginationNew'
import StakesTable from '@/components/StakesTable'
import UnlockStakeModal from '@/components/stakes/UnlockStakeModal'

export default {
  name: 'ViewStaking',
  data: function () {
    return {
      showUnlockStakeModal: false,
      stakeToUnlock: null,

      metadata: { totalCount: 0 },
      limit: 20
    }
  },
  components: {
    AccountPanel,
    Header,
    Pagination,
    StakesTable,
    UnlockStakeModal
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
    closeUnlockStakeModal() {
      this.stakeToUnlock = null
      this.showUnlockStakeModal = false
    },
    onStakesUpdate(metadata) {
      this.metadata = metadata
    },
    openUnlockStakeModal(stake) {
      this.stakeToUnlock = stake
      this.showUnlockStakeModal = true
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

