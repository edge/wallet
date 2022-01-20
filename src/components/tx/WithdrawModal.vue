<template>
  <Modal :close="cancel" :visible="visible && step === 1">
    <template v-slot:header>
      <h2 class="mb-8">Withdraw XE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      <span class="sub-heading d-block text-gray text-caption">
        <Amount :value="balance / 1e6" currency="XE"/> available
      </span>
    </template>
    <template v-slot:body>
      <div class="pb-4 min-h-410">
        <div class="form-group mb-8" :class="{'form-group__error': v$.recipient.$error}">
          <label for="send1" class="flex items-center space-x-3 label">
            Withdraw to
            <Tooltip
              class="ml-3" position="right" theme="dark" :wide="true"
              text="This is the Ethereum wallet that will hold your EDGE">
              <InformationCircleIcon class="hidden md:block button__icon w-15" />
            </Tooltip>
          </label>
          <input
            type="text"
            placeholder="Ethereum address"
            id="send1"
            maxlength="43"
            v-model="v$.recipient.$model"
          />
          <div class="form-group__error input-error" v-for="error of v$.recipient.$errors" :key="error.$uid">{{error.$message}}</div>
        </div>

        <div
          class="mt-32 lg-input-group"
          :class="{'form-group__error': v$.amount.$error}">
          <label for="key">Amount</label>
          <div class="relative input-wrap">
            <input
              type="text"
              id="amount-send"
              placeholder="0.00"
              v-model="v$.amount.$model"
              class="placeholder-white placeholder-opacity-100"
            >
            <span class="absolute right-0 text-xl curren top-23">XE</span>
            <div class="mt-5 form-group__error input-error" style="color: #CD5F4E" v-for="error of v$.amount.$errors" :key="error.$uid">{{error.$message}}</div>
          </div>
        </div>

        <div class="mt-32 mb-8 form-group">
          <label class="flex items-center space-x-3 label">
            Transaction speed
            <Tooltip
              class="ml-3" position="right" theme="dark" :wide="true"
              text="Faster transactions cost more gas in the Ethereum network">
              <InformationCircleIcon class="hidden md:block button__icon w-15" />
            </Tooltip>
          </label>
          <div class="flex flex-wrap mt-12 -mx-6 radio-list">
            <Radio name="speed" :selected="speed === 'slow'" @click="() => setSpeed('slow')" id="slow" :label="(gasRates.slow || '...') + ' XE'" :big="true" extraName="Slow"/>
            <Radio name="speed" :selected="speed === 'average'" @click="() => setSpeed('average')" id="average" :label="(gasRates.average || '...') + ' XE'" :big="true" extraName="Average"/>
            <Radio name="speed" :selected="speed === 'fast'" @click="() => setSpeed('fast')" id="fast" :label="(gasRates.fast || '...') + ' XE'" :big="true" extraName="Fast"/>
            <Radio name="speed" :selected="speed === 'fastest'" @click="() => setSpeed('fastest')" id="fastest" :label="(gasRates.fastest || '...') + ' XE'" :big="true" extraName="Fastest"/>
          </div>
        </div>
        <div class="mt-32 mb-8 form-group">
          <label class="flex items-center space-x-3">
            Estimated Cost
            <Tooltip class="ml-3" position="right" theme="dark" :text="`Inclusive of a ${minimumFee} XE handling fee`">
              <InformationCircleIcon class="hidden md:block button__icon w-15" />
            </Tooltip>
          </label>
          <Amount :value="fee" currency="XE" short sub/>
        </div>
      </div>
    </template>

    <template v-slot:footer>
      <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
        <div class="px-10 py-20 mb-32 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
          <div class="md:flex">
            <div class="left md:text-right md:w-1/2 md:flex md:pr-18 md:relative">
              <div class="md:flex-grow">
                <span class="block mb-3 text-gray">You are withdrawing</span>
                <span class="block text-xl text-white price">
                  <Amount :value="amountParsed" currency="XE" short/>
                </span>
              </div>
              <span class="flex justify-center p-12 pl-12 mx-auto mt-12 border border-gray-700 rounded-full md:ml-20 md:mt-0 md:flex-shrink-0 w-52 h-52 border-opacity-30 align-center">
                <img src="/assets/logo.svg" alt="XE Wallet" class="flex-shrink-0">
              </span>
              <span class="block mx-auto my-12 icon-arrow md:absolute md:m-0 md:top-1/2 md:-right-13 md:-mt-14 w-27 text-gray">
                <ArrowRightIcon class="hidden md:block"/>
                <ArrowDownIcon class="block md:hidden"/>
              </span>
            </div>
            <div class="right md:w-1/2 md:flex md:pl-18">
              <span class="flex justify-center p-8 mx-auto mb-12 bg-white border rounded-full md:mb-0 md:flex-shrink-0 md:mr-20 w-52 h-52 align-center">
                <img src="/assets/e-logo-alt.svg" alt="image description" class="flex-shrink-0">
              </span>
              <div class="md:flex-grow">
                <span class="block mb-3 text-gray">You should receive</span>
                <span class="block text-xl text-white price">
                  <Amount :value="edgeAmount" currency="EDGE"/>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
          <button class="w-full button button--outline-success" @click="cancel">Cancel</button>
          <button class="w-full button button--success" :disabled="!canReadyWithdraw" @click="readyWithdraw">Withdraw</button>
        </div>
      </div>
    </template>
  </Modal>

  <Modal :close="cancel" :visible="visible && step === 2">
    <template v-slot:header>
      <h2 class="mb-8">Withdraw XE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      <span class="sub-heading d-block text-gray text-caption">
        <Amount :value="balance / 1e6" currency="XE"/> available
      </span>
    </template>
    <template v-slot:body>
      <div class="pb-12 min-h-300">
        <div class="form-group mb-14">
          <label>You are withdrawing</label>
          <Amount :value="amount" currency="XE" sub/>
        </div>

        <div class="form-group mb-14">
          <label class="label">From</label>
          <div class="relative input-wrap">
            <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis text-caption">
              {{ address }}
            </span>
          </div>
        </div>

        <div class="form-group mb-14">
          <label class="label">To</label>
          <div class="relative input-wrap">
            <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis text-caption">
              {{ recipient }}
            </span>
          </div>
        </div>

        <div class="form-group mb-14">
          <label class="flex items-center space-x-3">
            Estimated Cost
            <Tooltip class="ml-3" position="right" theme="dark" :text="`Includes handling fee of ${minimumFee} XE`">
              <InformationCircleIcon class="hidden md:block button__icon w-15" />
            </Tooltip>
          </label>
          <Amount :value="fee" currency="XE" short sub/>
        </div>

        <div class="form-group mb-14">
          <label class="flex items-center space-x-3">
            You should receive
            <Tooltip
              class="ml-3" position="right" :wide="true" theme="dark"
              :text="`This is dependent on the final Ethereum transaction cost, you may receive more`">
              <InformationCircleIcon class="hidden md:block button__icon w-15" />
            </Tooltip>
          </label>
          <Amount :value="edgeAmount" currency="EDGE" sub/>
        </div>
      </div>
    </template>

    <template v-slot:footer>
      <div class="px-24 py-32 border-t border-gray-700 border-opacity-30">
        <div class="mb-24 form-group" :class="{'form-group__error': v$.password.$error}">
          <form>
            <label for="pass-withdraw">ENTER PASSWORD</label>
            <div class="relative input-wrap">
              <span class="icon">
                <LockOpenIcon/>
              </span>
              <input
                autocomplete="off"
                type="password"
                placeholder='Your password'
                id="pass-withdraw"
                v-model="v$.password.$model"
                @keypress="withdrawOnEnter"
              />
            </div>
            <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">{{error.$message}}</div>
          </form>
        </div>

        <div v-if="submitError" class="px-20 py-20 text-center bg-black border border-gray-700 rounded convert-info md:text-left red border-opacity-30 border-color">
          <div class="">
            <span class="flex w-full overflow-hidden overflow-ellipsis text-red">
              An error has occurred ({{ submitError }}). Please try again.
            </span>
          </div>
        </div>

        <div class="grid grid-cols-1 gap-24 pt-12 md:grid-cols-2">
          <button class="w-full button button--outline-success" @click="() => goto(1)">Back</button>
          <button class="w-full button button--success" :disabled="!canWithdraw" @click="withdraw">Confirm</button>
        </div>
      </div>
    </template>
  </Modal>

  <Modal :close="cancel" :visible="visible && step === 3">
    <template v-slot:header>
      <h2 class="mb-8">Withdrawal accepted<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
    </template>
    <template v-slot:body>
      <div class="pb-14 min-h-410">

        <div class="form-group mb-14">
          <label>You are withdrawing</label>
          <Amount :value="completedTx.amount / 1e6" currency="XE" short sub/>
        </div>

        <div class="form-group mb-14">
          <label>From</label>
          <div class="relative input-wrap">
            <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis text-caption">
              {{ address }}
            </span>
          </div>
        </div>

        <div class="form-group mb-14">
          <label>To</label>
          <div class="relative input-wrap">
            <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis text-caption">
              {{ completedTx.data.destination }}
            </span>
          </div>
        </div>

        <div class="form-group mb-14">
          <label>Estimated cost</label>
          <Amount :value="completedTx.data.fee / 1e6" currency="XE" short sub/>
        </div>

        <div class="form-group mb-14">
          <label>You should receive</label>
          <Amount :value="edgeAmountOnSubmit" currency="EDGE" sub/>
        </div>

        <div class="flex items-center mt-24 leading-8 text-gray">
          <p class="mb-0">Your request has been accepted and should be processed within 24 hours.</p>
        </div>
      </div>
    </template>

    <template v-slot:footer>
      <div class="px-24 pt-40 pb-40 border-t border-gray-700 border-opacity-30">
        <button class="block w-full mx-auto text-center button button--success md:w-1/2" @click="cancel">Close</button>
      </div>
    </template>
  </Modal>
</template>

<script>
import * as storage from '../../utils/storage'
import * as validation from '../../utils/validation'
import * as xe from '@edge/xe-utils'
import Amount from '../Amount'
import { InformationCircleIcon } from '@heroicons/vue/solid'
import Modal from '../Modal'
import Radio from '../Radio'
import Tooltip from '../Tooltip'
import { fetchGasRates } from '../../utils/api'
import { helpers } from '@vuelidate/validators'
import { mapState } from 'vuex'
import { parseAmount } from '../../utils/form'
import { toMicroXe } from '@edge/wallet-utils'
import useVuelidate from '@vuelidate/core'
import { ArrowDownIcon, ArrowRightIcon, LockOpenIcon } from '@heroicons/vue/outline'

const gasRatesUpdateInterval = 15 * 1000

export default {
  name: 'WithdrawModal',
  components: {
    Amount,
    ArrowDownIcon,
    ArrowRightIcon,
    InformationCircleIcon,
    LockOpenIcon,
    Modal,
    Radio,
    Tooltip
  },
  props: {
    close: Function,
    visible: Boolean,
  },
  data() {
    return {
      step: 1,

      gasRates: {},
      iGasRates: null,

      recipient: '',
      amount: '',
      speed: 'average',
      password: '',

      submitError: null,
      completedTx: null,
      edgeAmountOnSubmit: 0,
    }
  },
  validations() {
    return {
      recipient: [
        validation.required,
        validation.ethAddress
      ],
      amount: [
        validation.required,
        ...validation.amount(this.balance, this.amountParsed)
      ],
      password: [
        ...validation.password,
        helpers.withAsync(helpers.withMessage('Incorrect password.', this.checkPassword))
      ]
    }
  },
  computed: {
    ...mapState(['address', 'balance', 'nextNonce']),
    amountParsed() {
      return parseAmount(this.amount)
    },
    canReadyWithdraw() {
      return ![this.v$.recipient, this.v$.amount].map(f => f.$invalid).includes(true) && this.edgeAmount > 0
    },
    canWithdraw() {
      return !this.v$.$invalid && this.edgeAmount > 0
    },
    gasRate() {
      /*
      this.gasRates is a reactive (data) object, and its props can't be accessed via array-style notation:

          // logs undefined
          console.log(this.gasRates[this.speed])

      this computed prop works around the constraint, and simplifies access to the selected rate amount besides.
      */
      switch (this.speed) {
      case 'slow':
        return this.gasRates.slow
      case 'average':
        return this.gasRates.average
      case 'fast':
        return this.gasRates.fast
      case 'fastest':
        return this.gasRates.fastest
      default:
        return undefined
      }
    },
    minimumFee() {
      if (this.gasRate === undefined || this.amountParsed === NaN) return NaN
      const { handlingFeePercentage, minimumHandlingFee } = this.gasRates
      const percentageFee = this.amountParsed * (handlingFeePercentage / 100)
      return Math.max(percentageFee, minimumHandlingFee)
    },
    fee() {
      if (this.gasRate === undefined || this.amountParsed === NaN) return NaN
      return this.minimumFee + this.gasRate
    },
    edgeAmount() {
      return Math.max(0, this.amountParsed - this.fee)
    }
  },
  watch: {
    visible(v, oldv) {
      if (v === oldv) return
      if (v) {
        this.$store.dispatch('refresh')
        this.updateGasRates()
        this.iGasRates = setInterval(this.updateGasRates, gasRatesUpdateInterval)
      } else {
        clearInterval(this.iGasRates)
        this.iGasRates = null
      }
    }
  },
  methods: {
    cancel() {
      this.reset()
      this.close()
    },
    checkPassword(input) {
      return storage.comparePassword(input)
    },
    goto(step) {
      this.step = step
    },
    readyWithdraw() {
      // validate only step 1
      const fields = [this.v$.recipient, this.v$.amount]
      fields.forEach(f => f.$touch())
      if (fields.map(f => f.$error).includes(true)) return
      this.goto(2)
    },
    reset() {
      this.goto(1)
      this.recipient = ''
      this.amount = ''
      this.speed = 'average'
      this.password = ''
      this.submitError = null
      this.completedTx = null
      this.edgeAmountOnSubmit = 0
      this.v$.$reset()
    },
    setSpeed(speed) {
      this.speed = speed
    },
    async updateGasRates() {
      this.gasRates = await fetchGasRates()
    },
    async withdraw() {
      if (!await this.v$.$validate()) return
      const privateKey = await storage.getPrivateKey(this.password)

      // create tx
      const tx = xe.tx.sign({
        timestamp: Date.now(),
        sender: this.address,
        recipient: process.env.VUE_APP_BRIDGE_WALLET_ADDRESS,
        amount: toMicroXe(this.amountParsed),
        data: {
          destination: this.recipient,
          fee: toMicroXe(this.fee),
          memo: 'XE Withdrawal',
          token: 'EDGE'
        },
        nonce: this.nextNonce
      }, privateKey)

      // submit tx to blockchain
      const { metadata, results } = await xe.tx.createTransactions(process.env.VUE_APP_BLOCKCHAIN_API_URL, [tx])
      if (metadata.accepted) {
        this.completedTx = results[0]
        this.edgeAmountOnSubmit = this.edgeAmount
        this.goto(3)
      } else {
        this.submitError = results[0].reason
      }
    },
    withdrawOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.withdraw()
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
.sub-heading >>> .amount .currency {
  @apply ml-5;
}

.convert-info >>> .amount .currency {
  @apply ml-5;
}

.amount.sub {
  @apply text-white text-3xl;
}

.amount.sub >>> .currency {
  @apply text-half bottom-0 ml-2;
}

.testnet-header {
  color: #0ecc5f;
  padding-left: 10px;
}
</style>
