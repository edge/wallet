<template>
  <div class="transaction-table">
    <table>
      <thead class="hidden lg:table-header-group">
        <tr>
          <th width="23%">ID</th>
          <th width="23%">Hash</th>
          <th width="23%">Device</th>
          <th width="8%">Type</th>
          <th width="8%">Status</th>
          <th width="15%">Amount XE</th>
        </tr>
      </thead>
      <tbody v-if="stakes.length">
        <StakesTableItem  v-for="item in stakes" :key="item.id" :item="item"/>
      </tbody>
      <tbody v-else>
        <tr>
          <td colspan="7" class="block w-full text-center bg-white lg:table-cell py-35">
            No stakes.
          </td>
        </tr>
      </tbody>
    </table>
  </div>
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
    'limit',
    'skip'
  ],
  computed: mapState(['address']),
  mounted() {
    this.updateStakes()
    this.pollStakes()
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
          skip: this.skip
        }
      )
      this.stakes = stakes.results
      this.metadata = stakes.metadata
      this.totalPages = Math.ceil(stakes.metadata.totalCount / this.limit)
      this.loading = false
    },
    pollStakes() {
      this.iStakes = setInterval(() => {
        this.updateStakes()
      }, stakesRefreshInterval)
    }
  }
}
</script>

<style scoped>
table, tbody, tr {
  @apply block;
}

th {
  @apply font-normal text-sm2 text-left text-black bg-gray-100 border-b-2 border-gray-200;
}

th:last-child {
  @apply rounded-r-4 text-right;
}

@screen lg {
  tbody {
    @apply table-row-group;
  }

  table {
    @apply table;
  }

  tr {
    @apply table-row;
  }
}
</style>
