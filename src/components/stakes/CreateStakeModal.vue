<template>
  <div>
    <Modal :close="cancel" :visible="visible && step === 1">
      <template v-slot:header>
        <h2 class="mb-8">Create Stake<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>
      <template v-slot:body>
        <div class="pb-14">
          <div class="mb-16 form-group">
            <label>Current balance</label>
            <Amount :value="balance / 1e6" currency="XE" short sub/>
          </div>
          <div class="mb-16 form-group">
            <label>Stake Type</label>
            <div class="flex flex-wrap mt-12 -mx-6 radio-list">
              <Radio
                name="stake-type-host"
                id="host"
                extraName="Host"
                :label="hostStakeAmount"
                :selected="stakeType === 'host'"
                :big="true"
                @click="setStakeType('host')"
              />
              <Radio
                name="stake-type-gateway"
                id="gateway"
                extraName="Gateway"
                :label="gatewayStakeAmount"
                :selected="stakeType === 'gateway'"
                :big="true"
                @click="setStakeType('gateway')"
              />
              <Radio
                name="stake-type-stargate"
                id="stargate"
                extraName="Stargate"
                :label="stargateStakeAmount"
                :selected="stakeType === 'stargate'"
                :big="true"
                @click="setStakeType('stargate')"
              />
            </div>
          </div>
          <div class="mb-16 form-group">
            <label>Remaining Balance</label>
            <Amount :value="(balance - stakeAmount) / 1e6" currency="XE" short sub/>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="cancel">Cancel</button>
            <button
              class="w-full button button--success"
              :disabled="!canReadyCreate"
              @click="readyCreate">Create
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 2">
      <template v-slot:header>
        <h2 class="mb-8">Create Stake<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>
      <template v-slot:body>
        <div class="pb-14">
          <div class="mb-16 form-group">
            <label>Current balance</label>
            <Amount :value="balance / 1e6" currency="XE" short sub/>
          </div>
          <div class="form-group mb-25">
            <label class="label">Stake amount</label>
            <Amount :value="stakeAmount / 1e6" currency="XE" short sub/>
          </div>
          <div class="mb-16 form-group">
            <label>Remaining Balance</label>
            <Amount :value="(balance - stakeAmount) / 1e6" currency="XE" short sub/>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <form>
            <!-- eslint-disable-next-line max-len -->
            <div class="form-group" :class="{'form-group__error': v$.password.$error || (passwordError && !v$.password.$dirty)}">
              <label for="pass-step">Enter Password</label>
              <div class="relative input-wrap">
                <span class="icon">
                  <LockOpenIcon/>
                </span>
                <input
                  type="password"
                  autocomplete="off"
                  @keypress="sendOnEnter"
                  placeholder="Your password"
                  id="pass-step"
                  v-model="v$.password.$model"
                />
              </div>
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">{{error.$message}}</div>
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-if="passwordError && !v$.password.$dirty">{{passwordError}}</div>
            </div>
          </form>
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="() => goto(1)">Back</button>
            <button
              :disabled="!canCreate"
              @click="create"
              class="w-full button button--success"
            >Confirm stake</button>
          </div>
          <!-- eslint-disable-next-line max-len -->
          <div v-if="submitError" class="px-20 py-20 my-20 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
            <div class="">
              <span class="flex w-full overflow-hidden text-white overflow-ellipsis">
                {{ submitError }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 3">
      <template v-slot:header>
        <Logo/>
      </template>
      <template v-slot:body>
        <div class="pb-14">
          <div class="pb-4 mb-20 border-b border-gray-700 decor-block border-opacity-30">
            <!-- <CheckIcon class="w-52 text-green"/> -->
          </div>
          <div class="form-group mb-25">
            <label class="label">Recipient</label>
            <span class="break-all">{{ completedTx.recipient }}</span>
          </div>
          <div class="form-group mb-25">
            <label class="label">Memo</label>
            <span class="break-all">{{ completedTx.data.memo || 'None' }}</span>
          </div>
          <div class="mb-16 form-group">
            <label>Amount</label>
            <Amount :value="completedTx.amount / 1e6" currency="XE" short sub/>
          </div>
          <div class="mb-16 form-group">
            <label>Fee</label>
            <Amount :value="0" currency="XE" short sub/>
          </div>
          <div class="mb-0 form-group">
            <label>Recipient receives</label>
            <Amount :value="completedTx.amount / 1e6" currency="XE" short sub/>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-40 pb-40 border-t border-gray-700 border-opacity-30">
          <button
            @click="cancel"
            class="block w-full mx-auto text-center button button--success md:w-1/2"
          >Close</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
/*global process*/

import * as storage from '../../utils/storage'
import * as validation from '../../utils/validation'
import * as xe from '@edge/xe-utils'
import Amount from '../Amount'
import { LockOpenIcon } from '@heroicons/vue/outline'
import Logo from '../Logo'
import Modal from '../Modal'
import Radio from '../Radio'
import { mapState } from 'vuex'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'CreateStakeModal',
  components: {
    Amount,
    LockOpenIcon,
    Logo,
    Modal,
    Radio
  },
  props: {
    close: Function,
    visible: Boolean
  },
  data() {
    return {
      step: 1,

      recipient: '',
      amount: '',
      memo: '',
      password: '',
      passwordError: '',

      completedTx: null,
      submitError: '',

      stakeType: '',
      vars: null
    }
  },
  validations() {
    return {
      stakeAmount: [
        validation.required,
        ...validation.amount(this.balance, this.stakeAmountParsed)
      ],
      password: [validation.passwordRequired]
    }
  },
  computed: {
    ...mapState(['address', 'balance', 'nextNonce']),
    canReadyCreate() {
      return this.stakeType && this.balance - this.stakeAmount > 0
    },
    canCreate() {
      return !this.v$.$invalid
    },
    hostStakeAmount() {
      return this.vars.host_stake_amount
    },
    gatewayStakeAmount() {
      return this.vars.gateway_stake_amount
    },
    stargateStakeAmount() {
      return this.vars.stargate_stake_amount
    },
    stakeAmount() {
      if (this.stakeType === 'host') return this.vars.host_stake_amount
      else if (this.stakeType === 'gateway') return this.vars.gateway_stake_amount
      else if (this.stakeType === 'stargate') return this.vars.stargate_stake_amount
      else return 0
    },
    stakeAmountParsed() {
      return this.stakeAmount / 1e6
    }
  },
  watch: {
    visible(v, oldv) {
      if (v === oldv) return
      if (v) {
        this.$store.dispatch('refresh')
      }
    }
  },
  mounted() {
    this.getXeVars()
  },
  methods: {
    cancel() {
      this.reset()
      this.close()
    },
    async checkPassword() {
      this.v$.password.$reset()
      if (await storage.comparePassword(this.password)) {
        this.passwordError = ''
        return true
      }
      else {
        this.passwordError = 'Incorrect password.'
        return false
      }
    },
    goto(step) {
      this.step = step
    },
    async getXeVars() {
      this.vars = await xe.vars(process.env.VUE_APP_BLOCKCHAIN_API_URL)
    },
    readyCreate() {
      // validate only step 1
      if (this.canReadyCreate) return this.goto(2)
    },
    reset() {
      this.goto(1)

      this.stakeType = ''
      this.password = ''
      this.passwordError = ''

      this.v$.$reset()
    },
    sendOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.send()
    },
    setStakeType(type) {
      this.stakeType = type
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  }
}
</script>

<style scoped>
.stake-type {
  @apply flex flex-row justify-between
}

button:selected {
  color: red
}



.sub-heading :deep(.amount .currency) {
  @apply ml-5;
}

.amount.sub {
  @apply text-white text-3xl;
}

.amount.sub :deep(.currency) {
  @apply text-half bottom-0 ml-2;
}

.testnet-header {
  color: #0ecc5f;
  padding-left: 10px;
}
</style>
