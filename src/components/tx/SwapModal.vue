<template>
  <Modal :close="close" :preventClickOutside="true" :showCloseButton="true" :visible="visible" :width="900">
    <template v-slot:header>
      <h2>Swap<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
    </template>

    <template v-slot:body>
      <div class="grid grid-cols-1 gap-24 pt-12 pb-20 md:grid-cols-3">
        <div>
          <div class="leading-7 text-caption mb-65">
            <strong>Deposit</strong>
            <p class="mb-25">Convert EDGE to XE for staking, governance and service use.</p>
            <img src="/assets/deposit.svg" alt="Deposit EDGE for XE" class="account-panel__swap-img">
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
            <p class="mb-25">Convert XE to EDGE for use within the Ethereum network.</p>
            <img src="/assets/withdraw.svg" alt="Withdraw XE for EDGE" class="account-panel__swap-img">
          </div>
          <button class="w-full button--outline-success button" @click="openWithdraw">
            <span class="w-12 button__icon">
              <ArrowNarrowRightIcon/>
            </span>
            Withdraw
          </button>
        </div>
        <div>
          <div class="leading-7 text-caption mb-65">
            <strong>Sell</strong>
            <p class="mb-25">Sell XE for USDC on the Ethereum network.</p>
            <img src="/assets/sell.svg" alt="Sell XE for USDC" class="account-panel__swap-img">
          </div>
          <button class="w-full button--outline-success button" @click="openSell">
            <span class="w-12 button__icon">
              <CurrencyDollarIcon/>
            </span>
            Sell
          </button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from '../Modal'
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
