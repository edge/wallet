<template>
  <table>
    <thead class="hidden lg:table-header-group">
      <tr v-if="sortable">
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
          sortParam="sortStatus" :onSortingUpdate="updateSorting"
        />
        <TableHeader class="amount-col" width="10%" header="Amount XE" :sortQuery="sortQuery"
          sortParam="amount" :onSortingUpdate="updateSorting"
        />
        <th width="10%" v-if="stakes.length">&nbsp;</th>
      </tr>
      <tr v-else>
        <th width="19%">ID</th>
        <th width="19%">Hash</th>
        <th width="26%">Device</th>
        <th width="8%">Type</th>
        <th width="8%">Status</th>
        <th class="amount-col" width="10%">Amount XE</th>
        <th width="10%" v-if="stakes.length">&nbsp;</th>
      </tr>
    </thead>
    <tbody v-if="stakes.length">
      <StakesTableItem
        v-for="item in stakes"
        :key="item.id"
        :item="item"
        :openReleaseStakeModal="openReleaseStakeModal"
        :openUnlockStakeModal="openUnlockStakeModal"
      />
    </tbody>
    <tbody v-else-if="!loaded && loading">
      <td :colspan="!wallet ? 8 : 6" class="block w-full text-center bg-white lg:table-cell py-35">
        Loading...
      </td>
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
      loaded: false,
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
    'limit',
    'page',
    'receiveMetadata',
    'sortable',
    'openReleaseStakeModal',
    'openUnlockStakeModal'
  ],
  computed: {
    ...mapState(['address']),
    sortQuery() {
      return this.$route.query.sort
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
      // the sort query sent to index needs to include "-created", but this is hidden from user in browser url
      const sortQuery = this.$route.query.sort ? `${this.$route.query.sort},-created` : '-created'
      const stakes = await index.stake.stakes(
        process.env.VUE_APP_INDEX_API_URL,
        this.address,
        {
          limit: this.limit,
          page: this.page,
          sort: sortQuery
        }
      )
      this.stakes = stakes.results
      this.receiveMetadata(stakes.metadata)
      this.loaded = true
      this.loading = false
    },
    updateSorting(newSortQuery) {
      const query = { ...this.$route.query, sort: newSortQuery }
      if (!newSortQuery) delete query.sort
      this.$router.replace({ query })
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
