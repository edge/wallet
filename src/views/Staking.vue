<template>
  <div>
    <Header />
    <AccountPanel view="staking" />

    <ReleaseStakeModal
      :close="closeReleaseStakeModal"
      :visible="showReleaseStakeModal"
      :stake="stake"
    />
    <UnlockStakeModal
      :close="closeUnlockStakeModal"
      :visible="showUnlockStakeModal"
      :stake="stake"
    />

    <div class="bg-gray-200 py-35">
      <div class="container">
        <StakesTable
          :limit="limit"
          :receiveMetadata="onStakesUpdate"
          :page="currentPage"
          :sortable="true"
          :openReleaseStakeModal="openReleaseStakeModal"
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
import ReleaseStakeModal from '@/components/stakes/ReleaseStakeModal'
import StakesTable from '@/components/StakesTable'
import UnlockStakeModal from '@/components/stakes/UnlockStakeModal'

export default {
  name: 'ViewStaking',
  data: function () {
    return {
      showReleaseStakeModal: false,
      showUnlockStakeModal: false,
      stake: null,

      metadata: { totalCount: 0 },
      limit: 20
    }
  },
  components: {
    AccountPanel,
    Header,
    Pagination,
    ReleaseStakeModal,
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
    closeReleaseStakeModal() {
      this.stake = null
      this.showReleaseStakeModal = false
    },
    closeUnlockStakeModal() {
      this.stake = null
      this.showUnlockStakeModal = false
    },
    onStakesUpdate(metadata) {
      this.metadata = metadata
    },
    openReleaseStakeModal(stake) {
      this.stake = stake
      this.showReleaseStakeModal = true
    },
    openUnlockStakeModal(stake) {
      this.stake = stake
      this.showUnlockStakeModal = true
    }
  },
  watch: {
    metadata() {
      if (this.lastPage > 1) {
        const p = parseInt(this.$route.query.page) || 0
        if (p < 1) this.$router.replace({ ...this.$route.query, query: { page: 1 } })
      }
      // eslint-disable-next-line max-len
      if (this.currentPage > this.lastPage) this.$router.replace({ query: { ...this.$route.query, page: this.lastPage } })
    }
  }
}
</script>

