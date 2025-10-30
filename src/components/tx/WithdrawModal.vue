<template>
  <div>
    <Modal :close="cancel" :visible="visible && step === 1">
      <template v-slot:header>
        <h2 class="mb-8">Withdraw $EDGE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
        <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="balance / 1e6" currency="$EDGE"/> available
        </span>
      </template>
      <template v-slot:body>
        <div class="pb-4 min-h-300">
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
              <span class="absolute right-0 text-xl curren top-23">$EDGE</span>
              <div class="mt-5 form-group__error input-error" style="color: #CD5F4E" v-for="error of v$.amount.$errors" :key="error.$uid">{{error.$message}}</div>
            </div>
          </div>

          <div class="mt-32 mb-8 form-group">
            <label class="flex items-center space-x-3">
              Transaction fee
              <Tooltip
                :text="`Inclusive of a ${minimumFee} $EDGE handling fee`"
                class="ml-3"
                position="right"
                theme="dark"
              >
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
                  <span class="block mb-3 text-gray">You are withdrawing</span>
                  <span class="block text-xl text-white price">
                    <Amount :value="amountParsed" currency=""/>
                  </span>
                </div>
                <span class="flex justify-center p-12 pl-12 mx-auto mt-12 border border-gray-700 rounded-full md:ml-20 md:mt-0 md:flex-shrink-0 w-52 h-52 border-opacity-30 align-center">
                  <img src="/logo.svg" alt="XE Wallet" class="flex-shrink-0">
                </span>
                <span class="block mx-auto my-12 icon-arrow md:absolute md:m-0 md:top-1/2 md:-right-13 md:-mt-14 w-27 text-gray">
                  <ArrowRightIcon class="hidden md:block"/>
                  <ArrowDownIcon class="block md:hidden"/>
                </span>
              </div>
              <div class="right md:w-1/2 md:flex md:pl-18">
                <span class="flex justify-center p-8 mx-auto mb-12 bg-white border rounded-full md:mb-0 md:flex-shrink-0 md:mr-20 w-52 h-52 align-center">
                  <img src="/e-logo-alt.svg" alt="image description" class="flex-shrink-0">
                </span>
                <div class="md:flex-grow">
                  <span class="block mb-3 text-gray">You will receive</span>
                  <span class="block text-xl text-white price">
                    <Amount :value="edgeAmount" currency=""/>
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="cancel">Cancel</button>
            <button
              :disabled="!canReadyWithdraw"
              @click="readyWithdraw"
              class="w-full button button--success"
            >Withdraw</button>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 2">
      <template v-slot:header>
        <h2 class="mb-8">Withdraw $EDGE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
        <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="balance / 1e6" currency="$EDGE"/> available
        </span>
      </template>
      <template v-slot:body>
        <div class="pb-12 min-h-300">
          <div class="form-group mb-14">
            <label>You are withdrawing</label>
            <Amount :value="amount" currency="$EDGE" sub/>
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
              Transaction fee
              <Tooltip class="ml-3" position="right" theme="dark" :text="`Includes handling fee of ${minimumFee} $EDGE`">
                <InformationCircleIcon class="hidden md:block button__icon w-15" />
              </Tooltip>
            </label>
            <Amount :value="fee" currency="$EDGE" short sub/>
          </div>

          <div class="form-group mb-14">
            <label class="flex items-center space-x-3">
              You will receive
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
          <div class="mb-24 form-group" :class="{'form-group__error': v$.password.$error || (passwordError && !v$.password.$dirty)}">
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
            <label>Transaction fee</label>
            <Amount :value="feeOnSubmit" currency="$EDGE" short sub/>
          </div>

          <div class="form-group mb-14">
            <label>You will receive</label>
            <Amount :value="edgeAmountOnSubmit" currency="EDGE" sub/>
          </div>

          <div class="form-group mb-14">
            <label>Transaction hash</label>
            <HashLink to="explorer" :transaction="completedTx.hash" truncated />
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
import { fetchFees } from '../../utils/api'
import { mapState } from 'vuex'
import { parseAmount } from '../../utils/form'
import useVuelidate from '@vuelidate/core'
import { ArrowDownIcon, ArrowRightIcon, LockOpenIcon } from '@heroicons/vue/outline'

const gasRatesUpdateInterval = 15 * 1000

export default {
  name: 'WithdrawModal',
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

      fees: {},
      iFees: null,

      recipient: '',
      amount: '',
      password: '',
      passwordError: '',

      submitError: '',
      completedTx: null,
      edgeAmountOnSubmit: 0,
      feeOnSubmit: 0
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
      password: [validation.passwordRequired]
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
    minimumFee() {
      if (isNaN(this.amountParsed)) return NaN
      const { withdrawalMinFee, withdrawalPercentFee } = this.fees
      const percentageFee = this.amountParsed * (withdrawalPercentFee / 100)
      return Math.max(percentageFee, (withdrawalMinFee || 0) / 1e6)
    },
    fee() {
      if (isNaN(this.amountParsed)) return NaN
      return Math.round(this.minimumFee)
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
        this.updateFees()
        this.iFees = setInterval(this.updateFees, gasRatesUpdateInterval)
      }
      else {
        clearInterval(this.iFees)
        this.iFees = null
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
      this.password = ''

      this.submitError = ''
      this.completedTx = null
      this.edgeAmountOnSubmit = 0
      this.feeOnSubmit = 0

      this.v$.$reset()
    },
    async updateFees() {
      this.fees = await fetchFees()
    },
    async withdraw() {
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
          memo: 'Bridge Withdrawal',
          token: 'EDGE'
        },
        nonce: this.nextNonce
      }, privateKey)

      // submit tx to blockchain
      try {
        const capture = {
          edgeAmountOnSubmit: this.edgeAmount,
          feeOnSubmit: this.fee
        }
        const { metadata, results } = await xe.tx.createTransactions(import.meta.env.VITE_BLOCKCHAIN_API_URL, [tx])
        if (metadata.accepted) {
          this.completedTx = results[0]
          this.edgeAmountOnSubmit = capture.edgeAmountOnSubmit
          this.feeOnSubmit = capture.feeOnSubmit
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
