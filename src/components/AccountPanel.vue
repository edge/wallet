<template>
  <div class="account-panel">
    <div class="container">
      <div class="account-panel__address">
        Wallet address: <span>{{ wallet }}</span>
      </div>
      <div class="account-panel__info">
        <div class="account-panel__balance">
          <h3>
            Balance
          </h3>
          <h1>
            {{ balance }}<sub>XE</sub>
          </h1>
        </div>
        <div class="account-panel__buttons">
          <Modal
              with-close-button="true"
          >
            <template v-slot:opener="slotProps">
              <a href="#" class="button button--outline-success w-full" @click="slotProps.open">
            <span class="button__icon w-12">
              <ArrowUpIcon/>
            </span>
                Send
              </a>
            </template>
            <template v-slot:header>
              This is a new modal header.
            </template>

            <template v-slot:body>
              This is a new modal body.
            </template>

            <template v-slot:footer>
              This is a new modal footer.
            </template>
          </Modal>
          <Modal
              with-close-button="true"
          >
            <template v-slot:opener="slotProps">
              <a href="#" class="button button--outline-success w-full" @click="slotProps.open">
            <span class="button__icon w-12">
              <ArrowDownIcon/>
            </span>
                Receive
              </a>
            </template>
            <template v-slot:header>
              This is a new modal header. 2
            </template>

            <template v-slot:body>
              This is a new modal body.2
            </template>

            <template v-slot:footer>
              This is a new modal footer. 2
            </template>
          </Modal>
          <Modal
              with-close-button="true"
          >
            <template v-slot:opener="slotProps">
              <a href="#" class="button button--outline-success w-full" @click="slotProps.open">
            <span class="button__icon w-15">
              <SwitchHorizontalIcon/>
            </span>
                Exchange
              </a>
            </template>
            <template v-slot:header>
              <h2>Exchange</h2>
            </template>

            <template v-slot:body>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-24 pt-12 pb-20">
                <div class="">
                  <div class="text-caption leading-7 mb-65">
                    <strong>Withdraw</strong>
                    <p class="mb-25">Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
                    <img src="/assets/withdraw.svg" alt="image description">

                  </div>
                  <a href="#" class="button--outline-success button w-full">
                    <span class="button__icon w-12">
                      <ArrowNarrowRightIcon/>
                    </span>
                    Withdraw
                  </a>
                </div>
                <div class="">
                  <div class="text-caption leading-7 mb-65">
                    <strong>Deposit</strong>
                    <p class="mb-25">Lorem ipsum dolor sit amet, consectetur adipiscing.</p>
                    <img src="/assets/deposit.svg" alt="image description">
                  </div>

                  <a href="#" class="button--outline-success button w-full">
                    <span class="button__icon w-12">
                      <ArrowNarrowLeftIcon/>
                    </span>
                    Deposit
                  </a>
                </div>
              </div>
            </template>
          </Modal>
        </div>
      </div>
    </div>
  </div>


</template>

<script>
import {ArrowDownIcon, ArrowUpIcon, ArrowNarrowLeftIcon, ArrowNarrowRightIcon} from '@heroicons/vue/solid';
import {SwitchHorizontalIcon} from '@heroicons/vue/outline'
import Modal from "@/components/Modal";

export default {
  name: "AccountPanel",
  components: {
    ArrowDownIcon,
    ArrowUpIcon,
    SwitchHorizontalIcon,
    ArrowNarrowLeftIcon,
    ArrowNarrowRightIcon,
    Modal
  },
  data: function () {
    return {
      balance: 1574.987,
      wallet: 'xe_d4D5Fdb4d39A4c38d7Ca02b938049edA73b0fA53',
      isModalVisible: false
    }
  }
}
</script>

<style scoped>
.account-panel {
  @apply bg-black-100 pt-16 pb-9;
}

.account-panel__address {
  @apply text-gray text-sm2 mb-7;
}

.account-panel__address span {
  @apply text-white break-all block;
}

.account-panel__info h3 {
  @apply text-green mb-5;
}

.account-panel__info h1 {
  @apply text-white mb-0 font-normal;
}

.account-panel__info h1 sub {
  @apply bottom-0 text-half;
}

.account-panel__buttons {
  @apply grid gap-24 grid-cols-1  w-full flex-shrink-0;
}

.account-panel__balance {
  @apply flex-grow mb-6;
}

@screen md {
  .account-panel__address {
    @apply text-right pr-9 mb-12;
  }

  .account-panel__info {
    @apply flex items-center justify-between;
  }

  .account-panel__address span {
    @apply inline;
  }

  .account-panel__buttons {
    @apply grid-cols-3 max-w-560;
  }

  .account-panel__balance {
    @apply mb-0;
  }
}
</style>