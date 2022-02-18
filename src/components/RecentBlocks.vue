<template>
  <div class="w-full">
    <h3>RECENT BLOCKS</h3>

    <table class="w-full">
      <thead class="hidden lg:table-header-group">
        <tr>
          <th width="15%">Height</th>
          <th width="52%">Hash</th>
          <th>Mined</th>
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
          <td data-title="Height:" class="monospace">
            <a :href="`${explorerUrl}/block/${block.height}`" target="_blank" rel="noreferrer">
              {{ block.height }}
            </a>
          </td>
          <td data-title="Hash:">
            <a :href="`${explorerUrl}/block/${block.hash}`" target="_blank" rel="noreferrer">
              <span class="monospace">{{ block.hash.substr(0, 32) }}</span>
            </a>
          </td>
          <td data-title="Mined:">
            {{ timeSince(block.timestamp) }}
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
/*global process*/

import { fetchBlocks } from '../utils/api'
import moment from 'moment'

export default {
  name: 'RecentBlocks',
  data: function () {
    return {
      explorerUrl: process.env.VUE_APP_EXPLORER_URL || 'https://xe.network',
      loading: false,
      polling: null,
      blocks: []
    }
  },
  mounted() {
    this.loading = true
    this.fetchBlocks()
    this.pollData()
  },
  methods: {
    async fetchBlocks() {
      const { blocks } = await fetchBlocks({ limit: 7 })
      this.blocks = blocks
      this.loading = false
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

th {
  @apply font-normal text-sm2 text-left text-black bg-gray-100 px-5 border-b-2 border-gray-200 py-8;
}

/* th:first-child {
  @apply pt-8;
} */

th:last-child {
  @apply rounded-r-4;
}

td {
  @apply bg-white text-sm2 font-normal flex items-center px-5 break-all max-w-full;
}

td a {
  @apply leading-none border-b border-black border-opacity-25 hover:border-green hover:border-opacity-25 hover:text-green align-middle;
}

td::before {
  content: attr(data-title);
  @apply font-bold mr-8 min-w-100;
}

td:first-child {
  @apply rounded-l-4 pt-8;
}

td:last-child {
  @apply rounded-r-4 pb-8 border-b-4 border-gray-200;
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
    @apply border-gray-200 pt-13 pb-14 table-cell border-b-2 align-middle;
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
