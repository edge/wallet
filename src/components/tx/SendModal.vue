<template>
  <Modal :close="cancel" :visible="visible && step === 1">
    <template v-slot:header>
      <h2 class="mb-8">Send XE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      <span class="sub-heading d-block text-gray text-caption">{{ formatMicroXe(balance) }} XE available</span>
    </template>
    <template v-slot:body>
      <div class="pb-14 min-h-410">
        <div class="form-group" :class="{'form-group__error': v$.recipient.$error}">
          <label for="send-send" class="label">SEND TO</label>
          <input
            id="send-send"
            placeholder="XE address"
            ref="recipient"
            type="text"
            v-model="v$.recipient.$model"
          />
          <div class="form-group__error input-error" v-for="error of v$.recipient.$errors" :key="error.$uid">{{error.$message}}</div>
        </div>
        <div class="form-group" :class="{'form-group__error': v$.memo.$error}">
          <label for="memo" class="label">Memo (optional)</label>
          <input type="text" placeholder="Enter a memo" id="memo" v-model="v$.memo.$model"/>
          <div class="form-group__error input-error" v-for="error of v$.memo.$errors" :key="error.$uid">{{error.$message}}</div>
        </div>
        <div
          class="lg-input-group"
          :class="{'form-group__error': v$.amount.$error}"
        >
          <label for="amount-send">AMOUNT</label>
          <div class="relative input-wrap">
            <input
              type="text"
              id="amount-send"
              placeholder="0.00"
              v-model="v$.amount.$model"
              class="placeholder-white placeholder-opacity-100"
            />
            <span class="absolute right-0 text-xl currentColor top-23">XE</span>
            <div class="mt-5 form-group__error input-error" style="color: #CD5F4E" v-for="error of v$.amount.$errors" :key="error.$uid">{{error.$message}}</div>
          </div>
        </div>
        <div class="flex flex-wrap pt-12 radio-list">
          <Radio name="amount-send1" id="max" label="MAX" @click="setAmountAsPercent(100)" />
        </div>
      </div>
    </template>

    <template v-slot:footer>
      <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
        <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
          <button class="w-full button button--outline-success" @click="cancel">Cancel</button>
          <button class="w-full button button--success" :disabled="!canReadySend" @click="readySend">Send</button>
        </div>
      </div>
    </template>
  </Modal>

  <Modal :close="cancel" :visible="visible && step === 2">
    <template v-slot:header>
      <h2 class="mb-8">Send XE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      <span class="sub-heading d-block text-gray text-caption">{{ formatMicroXe(balance) }} XE available</span>
    </template>
    <template v-slot:body>
      <div class="pb-14 min-h-410">
        <div class="form-group mb-25">
          <label class="label">Send to</label>
          <span class="break-all">{{ recipient }}</span>
        </div>
        <div class="form-group mb-25">
          <label class="label">Memo</label>
          <span class="break-all">{{ memo || 'None' }}</span>
        </div>
        <div class="mb-16 form-group">
          <label>Amount</label>
          <Amount :value="amountParsed" currency="XE"/>
        </div>
        <div class="mb-16 form-group">
          <label>Fee</label>
          <Amount :value="0" currency="XE"/>
        </div>
        <div class="mb-0 form-group">
          <label>Recipient receives</label>
          <Amount :value="amountParsed" currency="XE"/>
        </div>
      </div>
    </template>

    <template v-slot:footer>
      <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
        <form>
          <div class="form-group" :class="{'form-group__error': v$.password.$error}">
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
            <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">{{error.$message}}</div>
          </div>
        </form>
        <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
          <button class="w-full button button--outline-success" @click="() => goto(1)">Back</button>
          <button class="w-full button button--success" :disabled="!canSend" @click="send">Confirm transaction</button>
        </div>
        <div class="form-group__error" v-if="submitError">{{ submitError }}</div>
      </div>
    </template>
  </Modal>

  <Modal :close="cancel" :visible="visible && step === 3">
    <template v-slot:header>
      <Logo/>
    </template>
    <template v-slot:body>
      <div class="pb-14 min-h-410">
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
          <Amount :value="formatMicroXe(completedTx.amount)" currency="XE"/>
        </div>
        <div class="mb-16 form-group">
          <label>Fee</label>
          <Amount :value="0" currency="XE"/>
        </div>
        <div class="mb-0 form-group">
          <label>Recipient receives</label>
          <Amount :value="formatMicroXe(completedTx.amount)" currency="XE"/>
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
import { LockOpenIcon } from '@heroicons/vue/outline'
import Logo from '../Logo'
import Modal from '../Modal'
import Radio from '../Radio'
import { helpers } from '@vuelidate/validators'
import { mapState } from 'vuex'
import { parseAmount } from '../../utils/form'
import useVuelidate from '@vuelidate/core'
import { toMicroXe, xeStringFromMicroXe } from '@edge/wallet-utils'

const memoRegexp = /^[a-zA-Z0-9\s-]{0,32}$/

export default {
  name: 'SendModal',
  components: {
    Amount,
    LockOpenIcon,
    Logo,
    Modal,
    Radio,
  },
  props: {
    close: Function,
    visible: Boolean,
  },
  data() {
    return {
      step: 1,

      recipient: '',
      amount: '',
      memo: '',
      password: '',

      completedTx: null,
      submitError: '',
    }
  },
  validations() {
    return {
      recipient: [
        validation.required,
        validation.xeAddress
      ],
      amount: [
        validation.required,
        ...validation.amount(this.balance, this.amountParsed)
      ],
      memo: [
        helpers.withMessage(
          'Memo is limited to 32 characters and should include only upper and lowercase letters, numbers, hyphens and spaces.',
          v => v.length === 0 || memoRegexp.test(v)
        ),
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
    canReadySend() {
      return ![this.v$.recipient, this.v$.memo, this.v$.amount].map(f => f.$invalid).includes(true)
    },
    canSend() {
      return !this.v$.$invalid
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
    formatMicroXe(mxe) {
      return xeStringFromMicroXe(mxe || 0, true)
    },
    goto(step) {
      this.step = step
    },
    readySend() {
      // validate only step 1
      const fields = [this.v$.recipient, this.v$.memo, this.v$.amount]
      fields.forEach(f => f.$touch())
      if (fields.map(f => f.$error).includes(true)) return
      this.goto(2)
    },
    reset() {
      this.goto(1)
      this.recipient = ''
      this.amount = ''
      this.memo = ''
      this.password = ''
      this.completedTx = null
      this.v$.$reset()
    },
    async send() {
      if (!await this.v$.$validate()) return
      const privateKey = await storage.getPrivateKey(this.password)

      // create tx
      const tx = xe.tx.sign({
        timestamp: Date.now(),
        sender: this.address,
        recipient: this.recipient,
        amount: toMicroXe(this.amountParsed),
        data: {
          memo: this.memo
        },
        nonce: this.nextNonce
      }, privateKey)

      // submit tx to blockchain
      const { metadata, results } = await xe.tx.createTransactions(process.env.VUE_APP_BLOCKCHAIN_API_URL, [tx])
      if (metadata.accepted) {
        this.completedTx = results[0]
        this.goto(3)
      }
      else {
        this.submitError = results[0].reason
      }
    },
    sendOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.send()
    },
    setAmountAsPercent(pct) {
      this.amount = ((this.balance / 1e6) * (pct / 100)).toFixed(6)
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
.testnet-header {
  color: #0ecc5f;
  padding-left: 10px;
}
</style>