<template>
  <Modal :close="close" :preventClickOutside="true" :showCloseButton="true" :visible="visible" :width="600">
    <template v-slot:header>
      <h2>Swap<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
    </template>

    <template v-slot:body>
      <div class="grid grid-cols-1 gap-24 pt-12 pb-20 md:grid-cols-2">
        <div>
          <div class="leading-7 text-caption mb-65">
            <strong>Deposit</strong>
            <p class="mb-25">Deposit $EDGE onto the XE blockchain for staking, governance and service use.</p>
            <img src="/deposit.svg" alt="Deposit $EDGE onto XE" class="account-panel__swap-img">
          </div>

          <button class="w-full button--outline-success button" @click="openDeposit">
            <span class="w-12 button__icon">
              <ArrowNarrowLeftIcon/>
            </span>
            Deposit
          </button>
        </div>
        <div>
          <div class="leading-7 text-caption mb-65">
            <strong>Withdraw</strong>
            <p class="mb-25">Withdraw $EDGE from the XE blockchain for use within the Ethereum network.</p>
            <img src="/withdraw.svg" alt="Withdraw $EDGE from XE" class="account-panel__swap-img">
          </div>
          <button class="w-full button--outline-success button" @click="openWithdraw">
            <span class="w-12 button__icon">
              <ArrowNarrowRightIcon/>
            </span>
            Withdraw
          </button>
        </div>
        <!-- <div>
          <div class="leading-7 text-caption mb-65">
            <strong>Sell</strong>
            <p class="mb-25">Sell $EDGE for USDC on the Ethereum network.</p>
            <img src="/sell.svg" alt="Sell $EDGE for USDC" class="account-panel__swap-img">
          </div>
          <button class="w-full button--outline-success button" @click="openSell">
            <span class="w-12 button__icon">
              <CurrencyDollarIcon/>
            </span>
            Sell
          </button>
        </div> -->
      </div>
      <div class="pt-8 pb-20 text-center" v-if="!bridgeOnline">
        <p class="font-bold mb-4">Bridge is currently unavailable, so transactions may be delayed.</p>
        <p>Please check again later or contact support for more information.</p>
      </div>
    </template>
  </Modal>
</template>

<script>
import { mapState } from 'vuex';
import Modal from '../Modal.vue'
import { ArrowNarrowLeftIcon, ArrowNarrowRightIcon, CurrencyDollarIcon } from '@heroicons/vue/outline'

export default {
  name: 'SwapModal',
  components: {
    ArrowNarrowLeftIcon,
    ArrowNarrowRightIcon,
    CurrencyDollarIcon,
    Modal
  },
  props: {
    close: Function,
    openDeposit: Function,
    openSell: Function,
    openWithdraw: Function,
    visible: Boolean
  },
  computed: {
    ...mapState(['bridgeOnline'])
  },
  watch: {
    visible() {
      if (this.visible) {
        this.$store.dispatch('refreshIndexConfig')
      }
    }
  }
}
</script>

<style scoped>
.account-panel__swap-img {
  height: 24px;
}

.testnet-header {
  color: #0ecc5f;
  padding-left: 10px;
}
</style>
