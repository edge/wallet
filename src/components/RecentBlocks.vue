<template>
  <div class="w-full">
    <h3>RECENT BLOCKS</h3>

    <table class="w-full">
      <thead class="hidden lg:table-header-group">
        <tr>
          <th width="15%">Height</th>
          <th width="20%">Hash</th>
          <th width="10%">Txs</th>
          <th width="25%" class="amount-col">Total XE</th>
          <th width="30%">Mined</th>
        </tr>
      </thead>
      <tbody v-if="loading">
        <tr>
          <td colspan="3" class="py-35 bg-white w-full text-center">
            Loading latest blocks...
          </td>
        </tr>
      </tbody>
      <tbody v-if="blocks.length">
        <tr v-for="block in blocks" :key="block.hash">
          <td data-title="Height:">
            <!-- eslint-disable-next-line max-len -->
            <a :href="`${explorerUrl}/block/${block.height}`" target="_blank" rel="noreferrer" class="monospace lg:inline-block">
              {{ block.height }}
            </a>
          </td>
          <td data-title="Hash:" :title="block.hash">
            <a :href="`${explorerUrl}/block/${block.hash}`" target="_blank" rel="noreferrer">
              <span class="monospace lg:inline-block">{{ block.hash }}</span>
            </a>
          </td>
          <td data-title="Txs:">
            <span class="monospace lg:inline-block">{{ block.transactions.length }}</span>
          </td>
          <td data-title="Total XE:" class="amount-col">
            <span class="monospace lg:inline-block">{{ formatAmount(block.total) }}</span>
          </td>
          <td data-title="Mined:" class="text-gray-600 lg:text-gray">
            <span class="lg:inline-block">
              <span class="mr-1 -mt-2 icon icon-grey"><ClockIcon /></span>
              <span class="monospace lg:font-sans lg:text-gray-400">
                {{ timeSince(block.timestamp) }}
              </span>
            </span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
/*global process*/
import { ClockIcon } from '@heroicons/vue/outline'
import { fetchBlocks } from '../utils/api'
import { formatXe } from '@edge/wallet-utils'
import moment from 'moment'

export default {
  name: 'RecentBlocks',
  data: function () {
    return {
      explorerUrl: process.env.VUE_APP_EXPLORER_URL || 'https://xe.network',
      loading: false,
      polling: null,
      blocks: [],
      isTestnet: process.env.VUE_APP_IS_TESTNET === 'true'
    }
  },
  components: {
    ClockIcon
  },
  mounted() {
    this.loading = true
    this.fetchBlocks()
    this.pollData()
  },
  methods: {
    async fetchBlocks() {
      const limit = this.isTestnet ? 5 : 7
      const { blocks } = await fetchBlocks({ limit })
      this.blocks = blocks
      this.loading = false
    },
    formatAmount(amount) {
      return formatXe(amount / 1e6, true)
    },
    pollData() {
      this.polling = setInterval(() => {
        this.fetchBlocks()
      }, 10000)
    },
    timeSince(ts) {
      return moment(ts).fromNow()
    }
  }
}
</script>

<style scoped>
table, tbody, tr {
  @apply block;
}

table {
  @apply w-full table-fixed
}

th {
  @apply font-normal text-sm2 text-left text-black bg-gray-100 px-5 border-b-2 border-gray-200 py-8 leading-tight;
}

th.amount-col {
  @apply text-right pr-30
}

th:last-child {
  @apply rounded-r-4;
}

td {
  @apply bg-white text-sm2 font-normal flex items-center px-5 break-all max-w-full;
}

td a {
  @apply border-b border-black border-opacity-25 hover:border-green hover:border-opacity-25 hover:text-green align-middle;
}

td span {
  @apply w-full overflow-ellipsis overflow-hidden whitespace-nowrap;
}

td a {
  @apply overflow-ellipsis overflow-hidden whitespace-nowrap;
}

td::before {
  content: attr(data-title);
  @apply font-normal mr-8 min-w-100 text-xs text-gray-600 pt-2;
}

td:first-child {
  @apply rounded-l-4 pt-8;
}

td:last-child {
  @apply rounded-r-4 pb-8 border-b-4 border-gray-200;
}

td .icon {
  @apply w-15 inline-block align-middle;
}

td .icon-grey {
  @apply lg:text-gray-400;
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

  th {
    @apply pt-13 pb-13 pr-30 pb-13;
  }

  th:first-child {
    @apply pl-20 pt-13;
  }

  td {
    @apply border-gray-200 pt-13 pb-13 table-cell border-b-2 align-middle;
  }

  td.amount-col {
    @apply text-right pr-30;
  }

  td:first-child {
    @apply pl-20 pt-13;
  }

  td:last-child {
    @apply pr-30 pb-13 border-b-2;
  }

  td:before {
    @apply hidden;
  }
}
</style>
