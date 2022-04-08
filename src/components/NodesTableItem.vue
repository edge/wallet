<template>
  <tr>
    <td data-title="Address:" :title="item.node.address">
      <a :href="explorerUrl" target="_blank" rel="noreferrer">
        <span class="monospace lg:inline-block">
          {{ item.node.address }}
        </span>
      </a>
    </td>

    <td data-title="Gateway:" :title="item.node.gateway">
      <a v-if="item.node.gateway" :href="gatewayUrl" target="_blank" rel="noreferrer">
        <span class="monospace lg:inline-block">
          {{ item.node.gateway }}
        </span>
      </a>
      <span v-else class="monospace lg:inline-block text-gray">
        N/A
      </span>
    </td>

    <td data-title="Stargate:" :title="item.node.stargate">
      <a v-if="item.node.stargate" :href="stargateUrl" target="_blank" rel="noreferrer">
        <span class="monospace lg:inline-block">
          {{ item.node.stargate }}
        </span>
      </a>
      <span v-else class="monospace lg:inline-block text-gray">
        N/A
      </span>
    </td>

    <td data-title="Type:">
      <span class="monospace lg:font-sans lg:inline-block">{{ formattedType }}</span>
    </td>

    <td data-title="Location:" :title="location">
      <span class="lg:inline-block"><span class="monospace lg:font-sans" :class="location === 'Unknown' && 'text-gray'">
        {{ location }}
      </span></span>
    </td>

    <td data-title="Availability:">
      <span class="monospace lg:inline-block">
        {{ (item.availability * 100).toFixed(2) }}%
      </span>
    </td>

    <td data-title="Status:">
      <span v-if="isOnline" class="lg:inline-block">
        <span class="mr-1 -mt-2 icon icon-green"><StatusOnlineIcon /></span>
        <span class="monospace lg:font-sans">Online</span>
      </span>
      <span v-else class="lg:inline-block">
        <span class="mr-1 lg:-mt-2 icon icon-grey"><StatusOfflineIcon /></span>
        <span class="monospace lg:font-sans text-gray">Offline</span>
      </span>
    </td>

    <td data-title="Last Seen:">
      <span class="lg:inline-block">
        <span class="mr-1 -mt-2 icon icon-grey"><ClockIcon /></span>
        <span class="monospace lg:font-sans text-gray">{{ lastActive }}</span>
      </span>
    </td>
  </tr>
</template>

<script>
/*global process*/

import moment from 'moment'
import { ClockIcon, StatusOfflineIcon, StatusOnlineIcon } from '@heroicons/vue/outline'

export default {
  name: 'NodesTableItem',
  props: ['item'],
  components: {
    ClockIcon,
    StatusOfflineIcon,
    StatusOnlineIcon
  },
  computed: {
    explorerUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/node/${this.item.node.address}`
    },
    gatewayUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/node/${this.item.node.gateway}`
    },
    stargateUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/node/${this.item.node.stargate}`
    },
    formattedType() {
      return this.item.node.type.charAt(0).toUpperCase() + this.item.node.type.slice(1)
    },
    location() {
      if (this.item.node.geo.city) return `${this.item.node.geo.city}, ${this.item.node.geo.country}`
      else if (this.item.node.geo.country) return this.item.node.geo.country
      else return 'Unknown'
    },
    isOnline() {
      return Date.now() - this.item.lastActive < 60000
    },
    lastActive() {
      const momentOutput = moment(this.item.lastActive).fromNow()
      if (this.isOnline && momentOutput == 'a few seconds ago') return 'Just now'
      else return momentOutput[0].toUpperCase() + momentOutput.slice(1)
    }
  }
}
</script>

<style scoped>
td {
  @apply bg-white text-sm2 font-normal flex items-center px-5 break-all max-w-full pb-4 leading-tight;
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

td .icon-green {
  @apply text-green;
}

td .icon-grey {
  @apply text-gray-400;
}

td a {
  @apply border-b border-black border-opacity-25 hover:border-green hover:border-opacity-25 hover:text-green align-middle;
}

@screen lg {
  td {
    @apply border-gray-200 pt-13 pb-10 table-cell border-b-2 align-middle;
  }

  td:first-child {
    @apply pl-20 pt-13;
  }

  td:last-child {
    @apply pb-10 border-b-2;
  }

  td:before {
    @apply hidden;
  }
}
</style>

