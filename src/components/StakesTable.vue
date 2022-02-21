<template>
  <table>
    <thead class="hidden lg:table-header-group">
      <tr v-if="!hideWalletColumn">
        <th width="10%" @click="updateSorting('id')">ID</th>
        <th width="10%" @click="updateSorting('hash')">Hash</th>
        <th width="20%" @click="updateSorting('wallet')">Wallet</th>
        <th width="24%" @click="updateSorting('device')">Device</th>
        <th width="8%" @click="updateSorting('type')">Type</th>
        <th width="8%" @click="updateSorting('released,unlockRequested')">Status</th>
        <th class="amount-col" width="10%" @click="updateSorting('amount')">Amount XE</th>
        <th width="10%" v-if="stakes.length">&nbsp;</th>
      </tr>
      <tr v-else>
        <th width="19%" @click="updateSorting('id')">
          ID
          <span class="mr-1 -mt-2 icon">
            <ChevronUpIcon v-if="isAscending('id')" />
            <ChevronDownIcon v-else-if="isDescending('id')"/>
          </span>
        </th>
        <th width="19%" @click="updateSorting('hash')">
          Hash
          <span class="mr-1 -mt-2 icon">
            <ChevronUpIcon v-if="isAscending('hash')" />
            <ChevronDownIcon v-else-if="isDescending('hash')"/>
          </span>
        </th>
        <th width="26%" @click="updateSorting('device')">
          Device
          <span class="mr-1 -mt-2 icon">
            <ChevronUpIcon v-if="isAscending('device')" />
            <ChevronDownIcon v-else-if="isDescending('device')"/>
          </span>
        </th>
        <th width="8%" @click="updateSorting('type')">
          Type
          <span class="mr-1 -mt-2 icon">
            <ChevronUpIcon v-if="isAscending('type')" />
            <ChevronDownIcon v-else-if="isDescending('type')"/>
          </span>
        </th>
        <th width="8%" @click="updateSorting('released,unlockRequested')">
          Status
          <span class="mr-1 -mt-2 icon">
            <ChevronUpIcon v-if="isAscending('released,unlockRequested')" />
            <ChevronDownIcon v-else-if="isDescending('released,unlockRequested')"/>
          </span>
        </th>
        <th class="amount-col" width="10%" @click="updateSorting('amount')">
          Amount XE
          <span class="mr-1 -mt-2 icon">
            <ChevronUpIcon v-if="isAscending('amount')" />
            <ChevronDownIcon v-else-if="isDescending('amount')"/>
          </span>
        </th>
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
import { mapState } from 'vuex'
import { ChevronDownIcon, ChevronUpIcon} from '@heroicons/vue/outline'

const stakesRefreshInterval = 5 * 1000

export default {
  name: 'StakesTable',
  data: function () {
    return {
      loading: false,
      metadata: null,
      sorting: ['-created'],
      stakes: [],
      iStakes: null
    }
  },
  components: {
    ChevronDownIcon,
    ChevronUpIcon,
    StakesTableItem
  },
  props: [
    'hideWalletColumn',
    'limit',
    'page',
    'receiveMetadata',
    'openReleaseStakeModal',
    'openUnlockStakeModal'
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
    isAscending(expression) {
      return this.sorting.includes(expression)
    },
    isDescending(expression) {
      return this.sorting.includes('-' + expression)
    },
    async updateStakes() {
      this.loading = true
      const stakes = await index.stake.stakes(
        process.env.VUE_APP_INDEX_API_URL,
        this.address,
        {
          limit: this.limit,
          page: this.page,
          sort: this.sorting.join(',')
        }
      )
      this.stakes = stakes.results
      this.receiveMetadata(stakes.metadata)
      this.loading = false
    },
    updateSorting(sortParam) {
      // sorting logic is:
      // - if param not in list, add to front of list (as descending)
      // - if param already in sorting list, bring to front (as descending)
      // - if already at front of list, toggle between descending > ascending > remove > descending

      // some sortParams will have multiple params (e.g. 'released,unlockRequested')
      // regex needs to include a - before every param
      const regex = new RegExp('-?' + sortParam.split(',').join(',-?'), 'g')

      const firstSortParam = this.sorting[0]
      if (regex.test(firstSortParam)) {
        if (firstSortParam[0] === '-') this.sorting = [sortParam, ...this.sorting.slice(1)]
        else this.sorting = this.sorting.slice(1)
      }
      else {
        const descExpression = '-' + sortParam.split(',').join(',-')
        this.sorting = [descExpression, ...this.sorting.filter(item => !regex.test(item))]
      }
    }
  },
  watch: {
    page() {
      this.updateStakes()
    },
    sorting() {
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

th .icon-active {
  @apply text-green
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
