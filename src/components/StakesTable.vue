<template>
  <table>
    <thead class="hidden lg:table-header-group">
      <tr v-if="!hideWalletColumn">
        <TableHeader width="10%" header="ID" :sortQuery="sortQuery"
          sortParam="id" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="10%" header="Hash" :sortQuery="sortQuery"
          sortParam="hash" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="20%" header="Wallet" :sortQuery="sortQuery"
          sortParam="wallet" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="24%" header="Device" :sortQuery="sortQuery"
          sortParam="device" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="8%" header="Type" :sortQuery="sortQuery"
          sortParam="type" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="8%" header="Status" :sortQuery="sortQuery"
          sortParam="released,unlockRequested" :onSortingUpdate="updateSorting"
        />
        <TableHeader class="amount-col" width="10%" header="Amount XE" :sortQuery="sortQuery"
          sortParam="amount" :onSortingUpdate="updateSorting"
        />
        <th width="10%" v-if="stakes.length">&nbsp;</th>
      </tr>
      <tr v-else>
        <TableHeader width="19%" header="ID" :sortQuery="sortQuery"
          sortParam="id" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="19%" header="Hash" :sortQuery="sortQuery"
          sortParam="hash" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="26%" header="Device" :sortQuery="sortQuery"
          sortParam="device" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="8%" header="Type" :sortQuery="sortQuery"
          sortParam="type" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="8%" header="Status" :sortQuery="sortQuery"
          sortParam="released,unlockRequested" :onSortingUpdate="updateSorting"
        />
        <TableHeader class="amount-col" width="10%" header="Amount XE" :sortQuery="sortQuery"
          sortParam="amount" :onSortingUpdate="updateSorting"
        />
        <th width="10%" v-if="stakes.length">&nbsp;</th>
      </tr>
    </thead>
    <tbody v-if="stakes.length">
      <StakesTableItem
        v-for="item in stakes"
        :key="item.id"
        :item="item"
        :hideWalletColumn="hideWalletColumn"
        :openReleaseStakeModal="openReleaseStakeModal"
        :openUnlockStakeModal="openUnlockStakeModal"
      />
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="7" class="block w-full text-center bg-white lg:table-cell py-35">
          No stakes.
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
/*global process*/

import * as index from '@edge/index-utils'
import StakesTableItem from '@/components/StakesTableItem'
import TableHeader from '@/components/TableHeader'
import { mapState } from 'vuex'

const stakesRefreshInterval = 5 * 1000

export default {
  name: 'StakesTable',
  data: function () {
    return {
      loading: false,
      metadata: null,
      stakes: [],
      iStakes: null
    }
  },
  components: {
    StakesTableItem,
    TableHeader
  },
  props: [
    'hideWalletColumn',
    'limit',
    'page',
    'receiveMetadata',
    'openReleaseStakeModal',
    'openUnlockStakeModal'
  ],
  computed: {
    ...mapState(['address']),
    sortQuery() {
      if (this.$route.query.sort) return this.$route.query.sort
      else return '-created'
    }
  },
  mounted() {
    this.updateStakes()
    // initiate polling
    this.iStakes = setInterval(() => {
      this.updateStakes()
    }, stakesRefreshInterval)
  },
  unmounted() {
    clearInterval(this.iStakes)
  },
  methods: {
    async updateStakes() {
      this.loading = true
      const stakes = await index.stake.stakes(
        process.env.VUE_APP_INDEX_API_URL,
        this.address,
        {
          limit: this.limit,
          page: this.page,
          sort: this.sortQuery
        }
      )
      this.stakes = stakes.results
      this.receiveMetadata(stakes.metadata)
      this.loading = false
    },
    updateSorting(newSortQuery) {
      this.$router.replace({ name: 'Staking', query: { ...this.$route.query, sort: newSortQuery } })
    }
  },
  watch: {
    page() {
      this.updateStakes()
    },
    sortQuery() {
      this.updateStakes()
    }
  }
}
</script>

<style scoped>
table {
  @apply w-full table-fixed
}

table, tbody, tr {
  @apply block;
}

th {
  @apply font-normal text-sm2 text-left text-black bg-gray-100 border-b-2 border-gray-200 py-13 px-5;
}

th:first-of-type {
  @apply pl-20;
}

th.amount-col {
  @apply text-right
}

th .icon {
  @apply w-15 inline-block align-middle text-gray-400;
}

@screen lg {
  table {
    @apply table;
  }

  tbody {
    @apply table-row-group;
  }

  tr {
    @apply table-row;
  }
}
</style>
