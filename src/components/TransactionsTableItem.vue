<template>
  <td data-title="Tx Hash:" :title="item.hash">
    <a v-if="!item.pending" :href="`${explorerUrl}/transaction/${item.hash}`" target="_blank" rel="noreferrer">
      <span class="hidden monospace md:inline-block">{{ sliceString(item.hash, 8) }}</span>
      <span class="monospace md:hidden">{{ sliceString(item.hash, 26) }}</span>
    </a>
    <div v-else>
      <span class="hidden monospace md:inline-block">{{ sliceString(item.hash, 8) }}</span>
      <span class="monospace md:hidden">{{ sliceString(item.hash, 26) }}</span>
    </div>
  </td>
  <td data-title="Date:">
    <span class="monospace md:font-sans">
      {{ item.date }}
    </span>
  </td>
  <td data-title="Address:">
    <span v-if="item.type.toLowerCase() === 'received'">
      <span class="icon icon-green mr-4"><ArrowDownIcon /></span>
      <a :href="`${explorerUrl}/wallet/${item.sender}`" target="_blank" rel="noreferrer">
        <span class="hidden lg:pl-10 monospace md:inline-block">{{ item.sender }}</span>
      </a>
      <span class="monospace md:hidden">{{ sliceString(item.sender, 26) }}</span>
    </span>
    <span v-if="item.type.toLowerCase() === 'sent'">
      <span class="icon icon-red mr-4"><ArrowUpIcon /></span>
      <a :href="`${explorerUrl}/wallet/${item.recipient}`" target="_blank" rel="noreferrer">
        <span class="hidden lg:pl-10 monospace md:inline-block">{{ item.recipient }}</span>
      </a>
      <span class="monospace md:hidden">{{ sliceString(item.recipient, 26) }}</span>
    </span>
  </td>
  <td :title="item.description" data-title="Memo:" :class="item.description === 'None' ? 'text-gray-400' : ''">
    <span class="monospace md:font-sans">{{ sliceString(item.description, 26) }}</span>
  </td>
  <td data-title="Status:">
    <span v-if="!isConfirmed(item)" class="mr-1 -mt-2 icon icon--confirmed icon-grey">
      <ClockIcon />
    </span>
    <span v-if="isConfirmed(item)" class="mr-1 -mt-2 icon icon--confirmed icon-green">
      <CheckCircleIcon />
    </span>
    <span class="monospace md:font-sans" :class="item.confirmations < 10 || !item.confirmations ? 'text-gray-400' : ''">{{ formatStatus(item) }}</span>
  </td>
  <td data-title="Amount:">
    <span class="monospace lg:font-sans">
      <span v-if="item.type.toLowerCase() === 'sent'">-</span>{{ formatAmount(item.amount) }}</span>
  </td>
</template>

<script>
const { formatXe } = require('@edge/wallet-utils')
import { ArrowDownIcon, ArrowUpIcon, CheckCircleIcon, ClockIcon } from "@heroicons/vue/outline"

export default {
  name: "TransactionsTableItem",
  props: ['item'],
  data: function() {
    return {
      explorerUrl: process.env.VUE_APP_EXPLORER_URL || 'https://xe.network',
    }
  },
  methods: {
    async copyToClipboard (input) {
      if (!!navigator.clipboard) {
        await navigator.clipboard.writeText(input)
      }
    },
    sliceString(string, symbols) {
      return string.length > symbols ? `${string.slice(0, symbols)}…` : string;
    },
    formatAmount(amount) {
      return formatXe(amount, true)
    },
    formatStatus(item) {
      if (item.pending) return 'Pending'
      if (item.confirmations === 1) return `${item.confirmations} confirmation`
      if (item.confirmations < 10) return `${item.confirmations} confirmations`
      return `Confirmed`
    },
    isConfirmed(item) {
      if (item.pending) return false
      if (item.confirmations === 1) return false
      if (item.confirmations < 10) return false
      return true
    }
  },
  components: {
    ArrowDownIcon,
    ArrowUpIcon,
    CheckCircleIcon,
    ClockIcon
  }
}
</script>

<style scoped>
td {
  @apply bg-white text-sm2 font-normal flex items-center px-5 break-all max-w-full pb-4;
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
td .icon--confirmed {
  @apply w-16 md:w-18;
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

td .arrow-icon {
  @apply absolute hidden pt-px lg:block w-14 h-14 -left-14 text-green;
}

td a {
  @apply leading-none border-b border-black border-opacity-25 hover:border-green hover:border-opacity-25 hover:text-green align-middle;
}

@screen lg {
  td {
    @apply border-gray-200 pt-13 pb-15 table-cell border-b-2 align-middle;
  }

  td:first-child {
    @apply pl-20 pt-13;
  }

  td:last-child {
    @apply pr-30 pb-13 text-right border-b-2;
  }

  td:before {
    @apply hidden;
  }
}
</style>
