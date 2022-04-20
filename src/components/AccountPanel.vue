<template>
  <div class="account-panel">

    <div class="container">
      <div class="account-panel__left">
        <div class="account-panel__address">
          <h3 class="mb-1">Address</h3>
          <span>{{ address }}</span>
        </div>

        <div class="account-panel__balance">
          <h3 class="mb-1">Balance</h3>
          <h1><Amount :value="balance / 1e6" currency="XE" sub/></h1>
          <h2>$ <Amount :value="usdBalance" currency=" USD" :decimalPlaces="2"/></h2>
        </div>
      </div>

      <div class="account-panel__right">
        <div v-if="view === 'staking'" class="account-panel__buttons">
          <button class="w-full button button--success col-start-1 col-span-2" @click="openCreateStake">
            <span class="w-12 button__icon">
              <PlusIcon class="w-15" />
            </span>
            Create Stake
          </button>
        </div>
        <div v-else class="account-panel__buttons">
          <button class="w-full button button--success" @click="openSend">
            <span class="w-12 button__icon">
              <ArrowUpIcon/>
            </span>
            Send
          </button>

          <button class="w-full button button--outline-success" @click="openReceive">
            <span class="w-12 button__icon">
              <ArrowDownIcon/>
            </span>
            Receive
          </button>

          <button class="w-full button button--outline-success" @click="openSwap">
            <span class="button__icon w-15">
              <SwitchHorizontalIcon/>
            </span>
            Swap
          </button>
        </div>
      </div>
    </div>

    <div class="account-panel__modals">
      <CreateStakeModal :close="reset" :visible="modal === 'createStake'"/>
      <DepositModal :close="reset" :visible="modal === 'deposit'"/>
      <ReceiveModal :close="reset" :visible="modal === 'receive'"/>
      <SellModal :close="reset" :visible="modal === 'sell'"/>
      <SendModal :close="reset" :visible="modal === 'send'"/>
      <SwapModal
        :close="reset"
        :openDeposit="openDeposit"
        :openWithdraw="openWithdraw"
        :openSell="openSell"
        :visible="modal === 'swap'"
      />
      <WithdrawModal :close="reset" :visible="modal === 'withdraw'"/>
    </div>
  </div>
</template>

<script>
import Amount from './Amount.vue'
import CreateStakeModal from './stakes/CreateStakeModal'
import DepositModal from './tx/DepositModal'
import ReceiveModal from './tx/ReceiveModal'
import SellModal from './tx/SellModal'
import SendModal from './tx/SendModal'
import SwapModal from './tx/SwapModal'
import WithdrawModal from './tx/WithdrawModal'
import { mapState } from 'vuex'
import { ArrowDownIcon, ArrowUpIcon, PlusIcon, SwitchHorizontalIcon } from '@heroicons/vue/outline'

export default {
  name: 'AccountPanel',
  props: ['view'],
  components: {
    Amount,
    ArrowDownIcon,
    ArrowUpIcon,
    CreateStakeModal,
    DepositModal,
    PlusIcon,
    ReceiveModal,
    SellModal,
    SendModal,
    SwapModal,
    SwitchHorizontalIcon,
    WithdrawModal
  },
  computed: mapState(['address', 'balance', 'usdBalance']),
  data() {
    return {
      modal: ''
    }
  },
  methods: {
    openCreateStake() {
      this.modal = 'createStake'
    },
    openDeposit() {
      this.modal = 'deposit'
    },
    openReceive() {
      this.modal = 'receive'
    },
    openSell() {
      this.modal = 'sell'
    },
    openSend() {
      this.modal = 'send'
    },
    openSwap() {
      this.modal = 'swap'
    },
    openWithdraw() {
      this.modal = 'withdraw'
    },
    reset() {
      this.modal = ''
    }
  }
}

</script>

<style scoped>
.account-panel {
  @apply bg-black-100 pt-16 pb-30;
}

.account-panel__left,
.account-panel__right {
  @apply w-full;
}

.account-panel__address {
  @apply text-gray text-sm2 mb-7 w-full;
}

.account-panel__address span {
  @apply text-white break-all block;
}

.account-panel__balance h3 {
  @apply text-green mb-5;
}

.account-panel__balance h2 {
  @apply text-gray-300 text-md mb-0;
}

.account-panel__balance h1 {
  @apply text-white mb-0 font-normal;
}

.account-panel__balance h1 :deep(sub) {
  @apply bottom-0 text-half;
}

.account-panel__buttons {
  @apply grid gap-6 grid-cols-1 w-full flex-shrink-0 mt-12;
}

.account-panel__buttons button {
  @apply w-full;
}

.account-panel__balance {
  @apply flex-grow mb-6;
}

.account-panel__modals {
  width: 1px;
}

@screen md {
  .account-panel .container {
    @apply flex flex-row justify-between items-end;
  }

  .account-panel__left,
  .account-panel__right {
    @apply w-auto;
  }

  .account-panel__address {
    @apply pr-9 my-12;
  }

  .account-panel__address span {
    @apply inline;
  }

  .account-panel__buttons {
    @apply grid grid-cols-3 mt-0;
  }

  .account-panel__buttons > button {
    width: 140px;
  }

  .account-panel__balance {
    @apply mb-0;
  }
}
</style>
