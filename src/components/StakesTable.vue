<template>
  <table>
    <thead class="hidden lg:table-header-group">
      <tr v-if="showWalletColumn">
        <th width="10%">ID</th>
        <th width="10%">Hash</th>
        <th width="24%">Wallet</th>
        <th width="30%">Device</th>
        <th width="8%">Type</th>
        <th width="8%">Status</th>
        <th width="10%">Amount XE</th>
      </tr>
      <tr v-else>
        <th width="22%">ID</th>
        <th width="22%">Hash</th>
        <th width="30%">Device</th>
        <th width="8%">Type</th>
        <th width="8%">Status</th>
        <th width="10%">Amount XE</th>
      </tr>
    </thead>
    <tbody v-if="stakes.length">
      <StakesTableItem
        v-for="item in stakes"
        :key="item.id"
        :item="item"
        :showWalletColumn="showWalletColumn"
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
import * as index from '@edge/index-utils'
import StakesTableItem from "@/components/StakesTableItem"
import { mapState } from 'vuex'

const stakesRefreshInterval = 5 * 1000

export default {
  name: "StakesTable",
  data: function () {
    return {
      loading: false,
      metadata: null,
      stakes: [],
      iStakes: null,
    }
  },
  components: {
    StakesTableItem
  },
  props: [
    'showWalletColumn',
    'limit',
    'page',
    'receiveMetadata'
  ],
  computed: mapState(['address']),
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
          page: this.page
        }
      )
      this.stakes = stakes.results
      this.receiveMetadata(stakes.metadata)
      this.loading = false
    },
  },
  watch: {
    page() {
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

th:last-of-type {
  @apply pr-30
}

th:last-child {
  @apply rounded-r-4 text-right;
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
