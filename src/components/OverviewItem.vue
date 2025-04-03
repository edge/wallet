<template>
  <div class="overview-item">
    <h2 class="overview-item__period h3">{{setting.date}}</h2>

    <div class="transactions-items">
      <div
        v-for="(item, index) in setting.items"
        :key="index"
        :class="['transaction-item', { 'item-active': activeIndex === index }]"
      >
        <div class="transaction-item__heading relative cursor-pointer"  @click="clickHandler(index)">
          <strong class="transaction-item__type">
            <span class="icon">
              <ArrowDownIcon v-if="item.head.type.toLowerCase() === 'received'"/>
              <ArrowUpIcon v-if="item.head.type.toLowerCase() === 'sent'"/>
            </span>
            {{item.head.type}}
          </strong>
          <strong class="transaction-item__amount">
            <span v-if="item.head.type.toLowerCase() === 'sent'">-</span>
              {{ item.head.amount }}
              $EDGE
          </strong>
          <span class="transaction-item__heading-icon">
            <ChevronDownIcon/>
          </span>
        </div>
        <Transition
          @before-enter="beforeEnter"
          @enter="enter"
          @before-leave="beforeLeave"
          @leave="leave"
          @after-leave="afterLeave"
        >
          <div class="transaction-item__slide" v-show="activeIndex === index">
            <div class="transaction-table">
              <table>
                <thead class="hidden lg:table-header-group">
                  <tr>
                    <th width="20%">Date</th>
                    <th width="35%">{{ item.head.type.toLowerCase() === 'sent' ? 'Sent to' : 'Received from'}}</th>
                    <th width="15%">Transaction ID</th>
                    <th width="30%">Memo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td data-title="Timestamp :">
                      {{item.description.date}}
                    </td>
                    <td data-title="Address :">
                      {{ item.description.address }}
                    </td>
                    <td data-title="Transaction ID :">
                      <router-link :to="{name: 'Transaction', params: { id: item.description.id }}">
                        {{ sliceString(item.description.id, 10) }}
                      </router-link>
                    </td>
                    <td data-title="Memo :">
                      {{ item.description.description }}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script>
import {ArrowDownIcon, ArrowUpIcon, ChevronDownIcon} from '@heroicons/vue/outline'

export default {
  name: 'OverviewItem',
  props: ['setting'],
  data() {
    return {
      activeIndex: ''
    }
  },
  methods: {
    sliceString(string, symbols) {
      return string.length > symbols ? string.slice(0, symbols) + '...' : string
    },
    clickHandler(index) {
      this.activeIndex = index === this.activeIndex ? -1 : index
    },
    start() {
      this.desktopFlag = window.innerWidth > this.breakpoint
    },
    enter(el, done) {
      el.style.height = el.scrollHeight + 'px'
      done()
    },
    beforeEnter() {
    },
    beforeLeave(el) {
      el.style.height = el.scrollHeight + 'px'
    },
    leave(el) {
      el.style.height = '0'
    },
    afterLeave(el) {
      el.style.height = 'auto'
    }
  },
  components: {
    ArrowDownIcon,
    ArrowUpIcon,
    ChevronDownIcon
  }
}
</script>

<style scoped>

  .overview-item {
    @apply mb-38;
  }

  .overview-item__period {
    @apply mb-18;
  }

  .transaction-item {
    @apply mb-2;
  }

  .transaction-item.item-active .transaction-item__heading {
    @apply bg-gray-100;
  }

  .transaction-item.item-active .transaction-item__heading-icon {
    transform: translateY(-50%) rotate(-180deg);
  }

  .transaction-item__heading {
    @apply bg-white rounded flex justify-between py-13 pl-18 pr-52 transition-all;
  }

  .transaction-item__type {
    @apply font-normal;
  }

  .icon {
    @apply w-18 text-green mr-12 inline-block align-middle;
  }

  .transaction-item__heading-icon {
    transform: translateY(-50%);
    @apply absolute top-1/2 right-20 w-18;
  }

  .transaction-item__slide {
    @apply pt-27 px-5 pb-50 bg-white bg-opacity-80 rounded-b;
  }

  .transaction-item__amount {
    @apply text-base2 font-normal;
  }

  th {
    @apply font-normal text-gray-300 text-left text-sm2;
  }

  td {
    @apply text-sm2 flex items-center px-5 break-all max-w-full;
  }

  td::before {
    content: attr(data-title);
    @apply font-bold mr-8 min-w-100;
  }

  td a {
    @apply text-green align-middle;
  }

  @screen md {
    .transaction-item__heading {
      @apply pr-123;
    }
  }

  @screen lg {
    .transaction-table thead th {
      @apply py-2;
    }

    td {
      @apply table-cell align-middle py-0;
    }

    td:first-child {
      @apply pl-20;
    }

    td:before {
      @apply hidden;
    }
  }
</style>
