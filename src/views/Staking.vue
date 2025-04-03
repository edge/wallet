<template>
  <div>
    <Header />
    <AccountPanel view="staking" />

    <AssignDeviceModal
      :close="closeAssignDeviceModal"
      :visible="showAssignDeviceModal"
      :stake="stake"
    />
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
        <div class="checkbox-container" @click="updateShowReleasedStakes" >
          <label>Show Released Stakes</label>
          <input type="checkbox" :checked="showReleasedStakes" />
          <span class="checkmark"></span>
        </div>
        <StakesTable
          :hideReleasedStakes="!showReleasedStakes"
          :limit="limit"
          :receiveMetadata="onStakesUpdate"
          :page="currentPage"
          :sortable="true"
          @assign="openAssignDeviceModal"
          @release="openReleaseStakeModal"
          @unlock="openUnlockStakeModal"
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
import AccountPanel from '@/components/AccountPanel.vue'
import AssignDeviceModal from '../components/stakes/AssignDeviceModal.vue'
import Header from '@/components/Header.vue'
import Pagination from '@/components/PaginationNew.vue'
import ReleaseStakeModal from '@/components/stakes/ReleaseStakeModal.vue'
import StakesTable from '@/components/StakesTable.vue'
import UnlockStakeModal from '@/components/stakes/UnlockStakeModal.vue'

export default {
  name: 'ViewStaking',
  data: function () {
    return {
      showAssignDeviceModal: false,
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
    UnlockStakeModal,
    AssignDeviceModal
  },
  computed: {
    currentPage() {
      return Math.max(1, parseInt(this.$route.query.page) || 1)
    },
    showReleasedStakes() {
      return this.$route.query.showReleased === '1' || false
    },
    lastPage() {
      return Math.max(1, Math.ceil(this.metadata.totalCount / this.limit))
    }
  },
  methods: {
    closeAssignDeviceModal() {
      this.stake = null
      this.showAssignDeviceModal = false
    },
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
    openAssignDeviceModal(stake) {
      this.stake = stake
      this.showAssignDeviceModal = true
    },
    openReleaseStakeModal(stake) {
      this.stake = stake
      this.showReleaseStakeModal = true
    },
    openUnlockStakeModal(stake) {
      this.stake = stake
      this.showUnlockStakeModal = true
    },
    updateShowReleasedStakes() {
      const showReleased = !this.showReleasedStakes ? 1 : undefined
      const query = { ...this.$route.query, showReleased }
      this.$router.replace({ query })
    }
  },
  watch: {
    metadata() {
      const numRegEx = /^[-+]?\d*$/
      if (this.$route.query.page) {
        if (this.$route.query.page < 1 || !numRegEx.test(this.$route.query.page)) {
          this.$router.replace({ query: { ...this.$route.query, page: 1 } })
        }
      }
      if (this.currentPage > this.lastPage) this.$router.replace({ query: { ...this.$route.query, page: this.lastPage } })
    }
  }
}
</script>

<style scoped>
.checkbox-container {
  @apply flex items-center mb-10 justify-end;
  cursor: pointer;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

.checkbox-container label {
  @apply cursor-pointer mr-5 mb-0;
}

.checkbox-container input {
  opacity: 0;
  height: 0;
  width: 0;
}

/* Create custom checkbox */
.checkmark {
  @apply cursor-pointer mr-5 mb-0;
  position: relative;
  height: 13px;
  width: 13px;
  border: solid 1px #787878;
  border-radius: 3px;
}

/* On mouse-over, add grey background color */
.checkbox-container:hover input ~ .checkmark {
  border-color: rgb(70, 70, 70);
}

/* When checkbox is checked, add green background */
.checkbox-container input:checked ~ .checkmark {
  background-color: rgb(14,204,95);
  border: none;
}

/* Create checkmark (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show checkmark when checked */
.checkbox-container input:checked ~ .checkmark:after {
  display: block;
}

/* Style for checkmark */
.checkbox-container .checkmark:after {
  left: 4px;
  top: 1px;
  width: 5px;
  height: 9px;
  border: solid white;
  border-width: 0 2px 2px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}
</style>

