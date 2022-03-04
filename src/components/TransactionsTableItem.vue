<template>
  <tr :class="isPending && 'pending'">
    <td data-title="Date:">
      <span class="md:inline-block">
        {{ date }}
      </span>
    </td>

    <td data-title="Tx Hash:" :title="item.hash">
      <a :href="explorerTxUrl" target="_blank" rel="noreferrer">
        <span class="monospace md:inline-block">
          {{ item.hash }}
        </span>
      </a>
    </td>

    <td v-if="sent" data-title="To:">
      <span class="icon-wrap">
        <span class="mr-1 -mt-2 icon icon-red"><ArrowUpIcon /></span>
        <a :href="explorerToAddressUrl" target="_blank" rel="noreferrer">
          <span class="monospace md:inline-block">
            {{ item.recipient }}
          </span>
        </a>
      </span>
    </td>
    <td v-else data-title="From:">
      <span class="icon-wrap">
        <span class="mr-1 -mt-2 icon icon-green"><ArrowDownIcon /></span>
        <a :href="explorerFromAddressUrl" target="_blank" rel="noreferrer">
          <span class="monospace md:inline-block">
            {{ item.sender }}
          </span>
        </a>
      </span>
    </td>

    <td data-title="Memo:">
      <span class="monospace md:font-sans" :class="!item.data.memo && 'text-gray'">
        {{ item.data.memo || 'None' }}
      </span>
    </td>

  <td data-title="Status:">
      <span v-if="isConfirmed && item.confirmations > 10">
        <span class="mr-1 -mt-2 icon icon-green"><CheckCircleIcon /></span>
        <span
          class="monospace md:font-sans">{{ statusFormatted }}</span>
      </span>
      <span v-else>
        <span class="mr-1 -mt-2 icon icon-grey"><ClockIcon/></span>
        <span
          class="monospace md:font-sans text-gray-400">{{ statusFormatted }}</span>
      </span>
    </td>

    <td data-title="Amount (XE):" class="amount-col">
      <span class="monospace">
        {{ `${sent ? '-' : ''}${formattedAmount}` }}
      </span>
    </td>

  </tr>
</template>

<script>
/*global process*/

import { formatXe } from '@edge/wallet-utils'
import { mapState } from 'vuex'
import { ArrowDownIcon, ArrowUpIcon, CheckCircleIcon, ClockIcon } from '@heroicons/vue/outline'

export default {
  name: 'StakesTableItem',
  props: [
    'item'
  ],
  components: {
    ArrowDownIcon,
    ArrowUpIcon,
    CheckCircleIcon,
    ClockIcon
  },
  computed: {
    ...mapState(['address']),
    date() {
      return new Date(this.item.timestamp).toLocaleString()
    },
    explorerFromAddressUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/wallet/${this.item.sender}`
    },
    explorerToAddressUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/wallet/${this.item.recipient}`
    },
    explorerTxUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/transaction/${this.item.hash}`
    },
    formattedAmount() {
      return formatXe(this.item.amount / 1e6, true)
    },
    isConfirmed() {
      return (!this.isPending || !this.item.confirmations < 10)
    },
    isPending() {
      return !this.item.block
    },
    statusFormatted() {
      if (this.isPending) return 'Pending'
      if (this.item.confirmations === 1) return `${this.item.confirmations} confirmation`
      if (this.item.confirmations < 10) return `${this.item.confirmations} confirmations`
      return 'Confirmed'
    },
    sent() {
      return this.item.sender === this.item.recipient || this.address === this.item.sender
    }
  }
}
</script>

<style scoped>
td {
  @apply bg-white text-sm2 font-normal flex items-center px-5 break-all max-w-full pb-4;
}

td span {
  @apply w-full overflow-ellipsis overflow-hidden whitespace-nowrap
}

td a {
  @apply overflow-ellipsis overflow-hidden whitespace-nowrap
}

.icon-wrap {
  @apply flex overflow-ellipsis overflow-hidden whitespace-nowrap
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

td .icon-green {
  @apply text-green;
}

td .icon-grey {
  @apply text-gray-400;
}

td .icon-red {
  @apply text-red;
}

td a {
  @apply leading-none border-b border-black border-opacity-25 hover:border-green hover:border-opacity-25 hover:text-green align-middle;
}

tr.pending {
  @apply italic text-gray-400
}

tr.pending a {
  @apply italic text-gray-400
}

@screen lg {
  td {
    @apply border-gray-200 pt-13 pb-15 table-cell border-b-2 align-middle;
  }

  td:first-child {
    @apply pl-20 pt-13;
  }

  td.amount-col {
    @apply text-right
  }

  td:last-child {
    @apply pr-30 pb-13 text-right border-b-2;
  }

  td:before {
    @apply hidden;
  }
}
</style>
