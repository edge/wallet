<template>
  <tr>
    <td data-title="ID:" :title="item.id">
      <a :href="explorerStakeUrl" target="_blank" rel="noreferrer">
        <span class="monospace md:inline-block">
          {{ item.id }}
        </span>
      </a>
    </td>

    <td data-title="Hash:">
      <span class="monospace md:inline-block">
        {{ item.hash }}
      </span>
    </td>

    <td v-if="!hideWalletColumn" data-title="Wallet:">
      <a :href="explorerWalletUrl" target="_blank" rel="noreferrer">
        <span class="monospace md:inline-block">
          {{ item.tx.recipient }}
        </span>
      </a>
    </td>

    <td data-title="Device:">
      <span v-if="item.device">
        <span class="monospace md:inline-block">
          {{ item.device }}
        </span>
      </span>
      <span v-else class="text-gray-400">None</span>
    </td>

    <td data-title="Type:">
      <span class="monospace md:font-sans">{{ formattedType }}</span>
    </td>

    <td data-title="Status:">
      <span v-if="item.released">
        <span class="mr-1 -mt-2 icon icon-grey"><ArrowCircleDownIcon/></span>
        <span>Released</span>
      </span>
      <span v-else-if="item.unlockRequested">
        <span v-if="isUnlocking">
          <span class="mr-1 -mt-2 icon icon-grey"><ClockIcon/></span>
          <span>Unlocking</span>
        </span>
        <span v-else>
          <span class="mr-1 -mt-2 icon icon-grey"><DotsCircleHorizontalIcon/></span>
          <span>Unlocked</span>
        </span>
      </span>
      <span v-else>
        <span class="mr-1 -mt-2 icon icon-green"><CheckCircleIcon/></span>
        <span>Active</span>
      </span>
    </td>

    <td data-title="Amount (XE):">
      <span class="monospace lg:font-sans">{{ formattedAmount }}</span>
    </td>

    <td data-title="">
      <button class="w-full table-button button--outline">{{ action }}</button>
    </td>
  </tr>
</template>

<script>
/*global process*/

import { formatXe } from '@edge/wallet-utils'
import { ArrowCircleDownIcon, CheckCircleIcon, ClockIcon, DotsCircleHorizontalIcon } from '@heroicons/vue/outline'

export default {
  name: 'StakesTableItem',
  props: ['hideWalletColumn', 'item'],
  components: {
    ArrowCircleDownIcon,
    CheckCircleIcon,
    ClockIcon,
    DotsCircleHorizontalIcon
  },
  computed: {
    action() {
      if (this.item.unlockRequested) return 'Release'
      else if (this.item.released) return ''
      else return 'Unlock'
    },
    address () {
      return this.item.tx.recipient
    },
    explorerStakeUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/stake/${this.item.id}`
    },
    explorerWalletUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/wallet/${this.address}`
    },
    formattedAmount() {
      return formatXe(this.item.amount / 1e6, true)
    },
    formattedType() {
      return this.item.type.charAt(0).toUpperCase() + this.item.type.slice(1)
    },
    isUnlocking() {
      return this.item.unlockRequested + this.item.unlockPeriod > Date.now()
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

td a {
  @apply leading-none border-b border-black border-opacity-25 hover:border-green hover:border-opacity-25 hover:text-green align-middle;
}

button.table-button {
  @apply py-2 rounded text-black border-solid border border-gray-400 text-gray-500 hover:border-green hover:text-green
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

