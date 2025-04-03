<template>
  <div>
    <Modal :close="cancel" :visible="visible && step === 1">
      <template v-slot:header>
        <h2 class="mb-8">Sell $EDGE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
        <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="balance / 1e6" currency="$EDGE"/> available
        </span>
      </template>
      <template v-slot:body>
        <div class="pb-4 min-h-410">
          <div class="form-group mb-8" :class="{'form-group__error': v$.recipient.$error}">
            <label for="recipient" class="flex items-center space-x-3 label">
              Ethereum address
              <Tooltip
                class="ml-3" position="right" theme="dark" :wide="true"
                text="This is the Ethereum wallet that will hold your USDC">
                <InformationCircleIcon class="hidden md:block button__icon w-15" />
              </Tooltip>
            </label>
            <input
              type="text"
              placeholder="Ethereum address"
              id="recipient"
              maxlength="43"
              v-model="v$.recipient.$model"
            />
            <div class="form-group__error input-error" v-for="error of v$.recipient.$errors" :key="error.$uid">{{error.$message}}</div>
          </div>

          <div
            class="mt-32 lg-input-group"
            :class="{'form-group__error': v$.amount.$error}">
            <label for="amount">Amount</label>
            <div class="relative input-wrap">
              <input
                type="text"
                id="amount"
                placeholder="0.00"
                v-model="v$.amount.$model"
                class="placeholder-white placeholder-opacity-100"
              />
              <span class="absolute right-0 text-xl curren top-23">$EDGE</span>
              <div class="mt-5 form-group__error input-error" style="color: #CD5F4E" v-for="error of v$.amount.$errors" :key="error.$uid">{{error.$message}}</div>
            </div>
          </div>

          <div class="mt-32 mb-8 form-group">
            <label class="flex items-center space-x-3">
              Exchange Rate
              <Tooltip class="ml-3" position="right" theme="dark" :wide="true" :text="`Last updated ${rateAge}`">
                <InformationCircleIcon class="hidden md:block button__icon w-15" />
              </Tooltip>
            </label>
            <Amount :value="exchangeRate.rate" currency="USDC" sub/>
          </div>

          <div class="mt-32 mb-8 form-group">
            <label class="flex items-center space-x-3">
              Transaction Fee
              <Tooltip class="ml-3" position="right" theme="dark" :wide="true" :text="`This covers the cost of the Ethereum transaction`">
                <InformationCircleIcon class="hidden md:block button__icon w-15" />
              </Tooltip>
            </label>
            <Amount :value="fee" currency="$EDGE" short sub/>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <div class="px-10 py-20 mb-32 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
            <div class="md:flex">
              <div class="left md:text-right md:w-1/2 md:flex md:pr-18 md:relative">
                <div class="md:flex-grow">
                  <span class="block mb-3 text-gray">You are selling</span>
                  <span class="block text-xl text-white price">
                    <Amount :value="amountParsed" currency="$EDGE" short/>
                  </span>
                </div>
                <span class="flex justify-center p-12 pl-12 mx-auto mt-12 border border-gray-700 rounded-full md:ml-20 md:mt-0 md:flex-shrink-0 w-52 h-52 border-opacity-30 align-center">
                  <img src="/logo.svg" alt="$EDGE" class="flex-shrink-0">
                </span>
                <span class="block mx-auto my-12 icon-arrow md:absolute md:m-0 md:top-1/2 md:-right-13 md:-mt-14 w-27 text-gray">
                  <ArrowRightIcon class="hidden md:block"/>
                  <ArrowDownIcon class="block md:hidden"/>
                </span>
              </div>
              <div class="right md:w-1/2 md:flex md:pl-18">
                <span class="flex justify-center p-8 mx-auto mb-12 bg-white border rounded-full md:mb-0 md:flex-shrink-0 md:mr-20 w-52 h-52 align-center">
                  <img src="/usd-coin-usdc-logo.svg" alt="USDC" class="flex-shrink-0">
                </span>
                <div class="md:flex-grow">
                  <span class="block mb-3 text-gray">You will receive</span>
                  <span class="block text-xl text-white price">
                    <Amount :value="usdcAmount" currency="USDC"/>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="cancel">Cancel</button>
            <button class="w-full button button--success" :disabled="!canReadySell" @click="readySell">Sell</button>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 2">
      <template v-slot:header>
        <h2 class="mb-8">Sell $EDGE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
        <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="balance / 1e6" currency="$EDGE"/> available
        </span>
      </template>
      <template v-slot:body>
        <div class="pb-12 min-h-300">
          <div class="form-group mb-14">
            <label>You are selling</label>
            <Amount :value="amountParsed" currency="$EDGE" short sub/>
          </div>

          <div class="form-group mb-14">
            <label class="label">From</label>
            <HashLink to="explorer" :wallet="address" />
          </div>

          <div class="form-group mb-14">
            <label class="label">To</label>
            <HashLink to="etherscan" :wallet="recipient" />
          </div>

          <div class="form-group mb-14">
            <label class="flex items-center space-x-3">
              Transaction Fee
              <Tooltip class="ml-3" position="right" theme="dark" :wide="true" :text="`This covers the cost of the Ethereum transaction`">
                <InformationCircleIcon class="hidden md:block button__icon w-15" />
              </Tooltip>
            </label>
            <Amount :value="fee" currency="$EDGE" short sub/>
          </div>

          <div class="form-group mb-14">
            <label class="flex items-center space-x-3">
              Exchange Rate
              <Tooltip class="ml-3" position="right" theme="dark" :wide="true" :text="`Last updated ${rateAge}`">
                <InformationCircleIcon class="hidden md:block button__icon w-15" />
              </Tooltip>
            </label>
            <Amount :value="exchangeRate.rate" currency="USDC" sub/>
          </div>

          <div class="form-group mb-14">
            <label class="flex items-center space-x-3">
              You will receive
            </label>
            <Amount :value="usdcAmount" currency="USDC" sub/>
          </div>
        </div>

        <div v-if="!withinSaleLimit" class="px-20 py-20 mb-24 text-center bg-black border border-gray-700 rounded convert-info md:text-left red border-opacity-30 border-color">
          <div class="">
            <span class="flex w-full overflow-hidden overflow-ellipsis text-red">
              Exchange rate has been updated. The swap maximum is now {{exchangeRate.limit}} $EDGE.
            </span>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 py-32 border-t border-gray-700 border-opacity-30">
          <div class="mb-24 form-group" :class="{'form-group__error': v$.password.$error || (passwordError && !v$.password.$dirty)}">
            <form>
              <label for="password">ENTER PASSWORD</label>
              <div class="relative input-wrap">
                <span class="icon">
                  <LockOpenIcon/>
                </span>
                <input
                  autocomplete="off"
                  type="password"
                  placeholder="Your password"
                  id="password"
                  v-model="v$.password.$model"
                  @keypress="sellOnEnter"
                />
              </div>
              <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">{{error.$message}}</div>
              <div class="form-group__error input-error" v-if="passwordError && !v$.password.$dirty">{{passwordError}}</div>
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
            <button class="w-full button button--success" :disabled="!canSell" @click="sell">Confirm</button>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 3">
      <template v-slot:header>
        <h2 class="mb-8">Sale accepted<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-410">

          <div class="form-group mb-14">
            <label>You are selling</label>
            <Amount :value="completedTx.amount / 1e6" currency="$EDGE" short sub/>
          </div>

          <div class="form-group mb-14">
            <label>From</label>
            <HashLink to="explorer" :wallet="address" />
          </div>

          <div class="form-group mb-14">
            <label>To</label>
            <HashLink to="etherscan" :wallet="completedTx.data.destination" />
          </div>

          <div class="form-group mb-14">
            <label>Transaction Fee</label>
            <Amount :value="feeOnSubmit" currency="$EDGE" short sub/>
          </div>

          <div class="form-group mb-14">
            <label>Exchange Rate</label>
            <Amount :value="exchangeRateOnSubmit" currency="USDC" sub/>
          </div>

          <div class="form-group mb-14">
            <label>You will receive</label>
            <Amount :value="usdcAmountOnSubmit" currency="USDC" sub/>
          </div>

          <div class="form-group mb-14">
            <label>Transaction hash</label>
            <HashLink to="explorer" :transaction="completedTx.hash" truncated />
          </div>

          <div class="flex items-center mt-24 leading-8 text-gray">
            <p class="mb-0">Your request has been accepted and should be processed soon. If your request cannot be processed for any reason, your $EDGE will be returned.</p>
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
import * as storage from '../../utils/storage'
import * as validation from '../../utils/validation'
import * as xe from '@edge/xe-utils'
import Amount from '../Amount.vue'
import HashLink from '../HashLink.vue'
import { InformationCircleIcon } from '@heroicons/vue/solid'
import Modal from '../Modal.vue'
import Tooltip from '../Tooltip.vue'
import { helpers } from '@vuelidate/validators'
import { mapState } from 'vuex'
import { parseAmount } from '../../utils/form'
import useVuelidate from '@vuelidate/core'
import { ArrowDownIcon, ArrowRightIcon, LockOpenIcon } from '@heroicons/vue/outline'
import { fetchExchangeRates, fetchGasRates } from '../../utils/api'

const exchangeRateUpdateInterval = 15 * 1000
const gasRatesUpdateInterval = 15 * 1000

export default {
  name: 'SellModal',
  components: {
    Amount,
    ArrowDownIcon,
    ArrowRightIcon,
    HashLink,
    InformationCircleIcon,
    LockOpenIcon,
    Modal,
    Tooltip
  },
  props: {
    close: Function,
    visible: Boolean
  },
  data() {
    return {
      step: 1,

      exchangeRate: {},
      gasRates: {},
      iExchangeRate: null,
      iGasRates: null,

      recipient: '',
      amount: '',
      password: '',
      passwordError: '',

      completedTx: null,
      submitError: '',
      feeOnSubmit: 0,
      exchangeRateOnSubmit: 0,
      usdcAmountOnSubmit: 0
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
        ...validation.amount(this.balance, this.amountParsed),
        helpers.withParams(
          { saleLimit: this.saleLimit },
          helpers.withMessage(`The exchange maximum is ${this.saleLimit} $EDGE.`, () => this.withinSaleLimit)
        )
      ],
      password: [validation.passwordRequired]
    }
  },
  computed: {
    ...mapState(['address', 'balance', 'nextNonce']),
    amountParsed() {
      return parseAmount(this.amount)
    },
    canReadySell() {
      return ![this.v$.recipient, this.v$.amount].map(f => f.$invalid).includes(true) && this.usdcAmount > 0
    },
    canSell() {
      return !this.v$.$invalid && this.withinSaleLimit && this.usdcAmount > 0
    },
    saleLimit() {
      return this.exchangeRate.limit || 0
    },
    withinSaleLimit() {
      return this.amountParsed <= this.saleLimit
    },
    rateAge() {
      if (this.exchangeRate.date === undefined) return '...'
      const date = new Date(this.exchangeRate.date)
      const ms = Date.now() - date.getTime()
      const s = Math.floor(ms / 1000)
      const unit = s === 1 ? 'second' : 'seconds'
      return `${s} ${unit} ago`
    },
    minimumFee() {
      if (this.gasRates.minimumHandlingFee === undefined) return NaN
      if (this.exchangeRate.gas === undefined) return NaN
      const { handlingFeePercentage, minimumHandlingFee } = this.gasRates
      const percentageFee = this.amountParsed * (handlingFeePercentage / 100)
      return Math.max(percentageFee, minimumHandlingFee)
    },
    fee() {
      if (this.exchangeRate.gas === undefined) return NaN
      return Math.round(this.minimumFee + this.exchangeRate.gas)
    },
    usdcAmount() {
      return Math.max(0, this.amountParsed - this.fee) * this.exchangeRate.rate
    }
  },
  watch: {
    visible(v, oldv) {
      if (v === oldv) return
      if (v) {
        this.$store.dispatch('refresh')
        this.updateExchangeRate()
        this.updateGasRates()
        this.iExchangeRate = setInterval(this.updateExchangeRate, exchangeRateUpdateInterval)
        this.iGasRates = setInterval(this.updateGasRates, gasRatesUpdateInterval)
      }
      else {
        clearInterval(this.iExchangeRate)
        clearInterval(this.iGasRates)
        this.iExchangeRate = null
        this.iGasRates = null
      }
    }
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
    readySell() {
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
      this.password = ''

      this.completedTx = null
      this.submitError = ''
      this.feeOnSubmit = 0
      this.exchangeRateOnSubmit = 0
      this.usdcAmountOnSubmit = 0

      this.v$.$reset()
    },
    async sell() {
      this.passwordError = ''

      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return
      const privateKey = await storage.getPrivateKey(this.password)

      // create tx
      const tx = xe.tx.sign({
        timestamp: Date.now(),
        sender: this.address,
        recipient: import.meta.env.VITE_BRIDGE_WALLET_ADDRESS,
        amount: xe.xe.toMxe(this.amountParsed),
        data: {
          destination: this.recipient,
          ref: this.exchangeRate.ref,
          memo: 'XE Sale',
          token: 'USDC'
        },
        nonce: this.nextNonce
      }, privateKey)

      // submit tx to blockchain
      try {
        const { metadata, results } = await xe.tx.createTransactions(import.meta.env.VITE_BLOCKCHAIN_API_URL, [tx])
        if (metadata.accepted) {
          this.completedTx = results[0]
          this.feeOnSubmit = this.fee
          this.exchangeRateOnSubmit = this.exchangeRate.rate
          this.usdcAmountOnSubmit = this.usdcAmount
          this.goto(3)
        }
        else {
          this.submitError = results[0].reason
        }
      }
      catch (err) {
        console.error(err)
        this.submitError = err.message
      }
    },
    sellOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.sell()
    },
    async updateExchangeRate() {
      this.exchangeRate = await fetchExchangeRates()
    },
    async updateGasRates() {
      this.gasRates = await fetchGasRates()
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
.sub-heading :deep(.amount .currency) {
  @apply ml-5;
}

.convert-info :deep(.amount .currency) {
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
