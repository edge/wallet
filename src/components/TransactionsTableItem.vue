<template>
  <td data-title="Date :">{{ item.date }}</td>
  <td data-title="Address :">
    <span v-if="item.type.toLowerCase() === 'received'">
      <span class="icon icon-green mr-4"><ArrowDownIcon /></span>
      <span class="monospace">{{ item.sender }}</span>
    </span>
    <span v-if="item.type.toLowerCase() === 'sent'">
      <span class="icon icon-red mr-4"><ArrowUpIcon /></span>
      <span class="monospace">{{ item.recipient }}</span>
    </span>
  </td>
  <td data-title="Tx Hash:" :title="item.hash">
    <!-- <router-link :to="{name: 'Transaction', params: {id}}"> -->
    <span class="monospace">{{ sliceString(item.hash, 10) }}</span>
    <!-- </router-link> -->
  </td>
  <td data-title="Memo :">
    {{ item.description }}
  </td>
  <td data-title="Status :">
    <span v-if="item.confirmations >= 10" class="icon icon-green mr-0 -mt-2"><CheckCircleIcon /></span>
    {{ formatStatus(item) }}
  </td>
  <td data-title="Amount: ">
    <span v-if="item.type.toLowerCase() === 'sent'">-</span>
    {{ formatAmount(item.amount) }}
    XE
  </td>
</template>

<script>
const { toMicroXe, xeStringFromMicroXe } = require('@edge/wallet-utils')
import { ArrowDownIcon, ArrowUpIcon, CheckCircleIcon } from "@heroicons/vue/outline"

export default {
  name: "TransactionsTableItem",
  props: ['item'],
  methods: {
    async copyToClipboard (input) {
      if (!!navigator.clipboard) {
        await navigator.clipboard.writeText(input)
      }
    },
    sliceString(string, symbols) {
      return string.length > symbols ? string.slice(0, symbols) : string;
    },
    formatAmount(amount) {
      return xeStringFromMicroXe(toMicroXe(amount), true)
    },
    formatStatus(item) {
      if (item.pending) return 'Pending'
      if (item.confirmations === 1) return `${item.confirmations} confirmation`
      if (item.confirmations < 10) return `${item.confirmations} confirmations`
      return `Confirmed`
    }
  },
  components: {
    ArrowDownIcon,
    ArrowUpIcon,
    CheckCircleIcon
  }
}
</script>

<style scoped>
td {
  @apply bg-white text-sm2 font-normal flex items-center px-5 break-all max-w-full;
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

td .icon {
  @apply w-15 inline-block align-middle;
}

td .icon-green {
  @apply text-green;
}

td .icon-red {
  @apply text-red;
}

td a {
  @apply text-green align-middle;
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
