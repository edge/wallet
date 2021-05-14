<template>
  <td data-title="Type :">
      <span class="icon">
        <ArrowNarrowRightIcon v-if="type.toLowerCase() === 'received'"/>
        <ArrowNarrowUpIcon v-if="type.toLowerCase() === 'sent'"/>
      </span>
    {{ type }}
  </td>
  <td data-title="Time :">{{ date }}</td>
  <td data-title="Address :">{{ sliceString(address, 25) }}</td>
  <td data-title="Transaction ID:">
    <router-link :to="{name: 'Transaction', params: {id}}">
      {{ sliceString(id, 18) }}
    </router-link>
  </td>
  <td data-title="Memo :">
    {{ description }}
  </td>
  <td data-title="Amount: ">
    <span v-if="type.toLowerCase() === 'sent'">-</span>
    {{ amount }}
    XE
  </td>
</template>

<script>
import {ArrowNarrowRightIcon, ArrowNarrowUpIcon} from "@heroicons/vue/outline"

export default {
  name: "TransactionsTableItem",
  props: ['type', 'id', 'date', 'address', 'description', 'amount'],
  methods: {
    sliceString(string, symbols) {
      return string.length > symbols ? string.slice(0, symbols) + '...' : string;
    }
  },
  components: {
    ArrowNarrowRightIcon,
    ArrowNarrowUpIcon
  }
}
</script>

<style scoped>
td {
  @apply bg-white text-sm2 flex items-center px-5 break-all max-w-full;
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