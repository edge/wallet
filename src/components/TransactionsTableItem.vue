<template>
  <td>
    <span class="icon">
      <ArrowDownIcon v-if="item.type.toLowerCase() === 'received'"/>
      <ArrowUpIcon v-if="item.type.toLowerCase() === 'sent'"/>
    </span>
  </td>
  <td data-title="Tx Hash:" :title="item.hash">
    <!-- <router-link :to="{name: 'Transaction', params: {id}}"> -->
    {{ sliceString(item.hash, 7) }}
    <!-- </router-link> -->
  </td>
  <td data-title="Date :">{{ item.date }}</td>
  <td
    class="text-green cursor-pointer"
    data-title="From :"
    :title="item.sender.concat(' (click to copy)')"
    @click="copyToClipboard(item.sender)"
  >
    {{ sliceString(item.sender, 25) }}
  </td>
  <td
    class="text-green cursor-pointer"
    data-title="To :" 
    :title="item.recipient.concat(' (click to copy)')"
    @click="copyToClipboard(item.recipient)"
  >
    {{ sliceString(item.recipient, 25) }}
  </td>
  <td data-title="Memo :">
    {{ item.description }}
  </td>
  <td data-title="Amount: ">
    <span v-if="item.type.toLowerCase() === 'sent'">-</span>
    {{ item.amount }}
    XE
  </td>
</template>

<script>
import {ArrowDownIcon, ArrowUpIcon} from "@heroicons/vue/outline"

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
      return string.length > symbols ? string.slice(0, symbols) + '...' : string;
    }
  },
  components: {
    ArrowDownIcon,
    ArrowUpIcon
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
  @apply w-15 text-green mr-8 inline-block align-middle;
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