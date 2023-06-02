<template>
  <div>
    <Modal :close="cancel" :visible="visible && step === 1">
      <template v-slot:header>
        <h2 class="mb-8">Send XE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
        <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="balance / 1e6" currency="XE"/> available
        </span>
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
            <Radio name="amount-send1" id="max" label="MAX" :selected="isMaxAmountEntered" @click="setAmountAsPercent(100)" />
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
        <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="balance / 1e6" currency="XE"/> available
        </span>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-410">
          <div class="form-group mb-14">
            <label class="label">Send to</label>
            <HashLink to="explorer" :wallet="recipient" />
          </div>
          <div class="form-group mb-14 text-xl">
            <label class="label">Memo</label>
            <span class="break-all">{{ memo || 'None' }}</span>
          </div>
          <div class="mb-16 form-group">
            <label>Amount</label>
            <Amount :value="amountParsed" currency="XE" short sub/>
          </div>
          <div class="mb-16 form-group">
            <label>Fee</label>
            <Amount :value="0" currency="XE" short sub/>
          </div>
          <div class="mb-0 form-group">
            <label>Recipient receives</label>
            <Amount :value="amountParsed" currency="XE" short sub/>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <form>
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
              <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">{{error.$message}}</div>
              <div class="form-group__error input-error" v-if="passwordError && !v$.password.$dirty">{{passwordError}}</div>
            </div>
          </form>
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="() => goto(1)">Back</button>
            <button
              :disabled="!canSend"
              @click="send"
              class="w-full button button--success"
            >Confirm transaction</button>
          </div>
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
        <h2 class="mb-8">Transaction sent<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-410">
          <div class="form-group mb-14">
            <label class="label">Recipient</label>
            <HashLink to="explorer" :wallet="completedTx.recipient" />
          </div>
          <div class="form-group mb-14 text-xl">
            <label class="label">Memo</label>
            <span class="break-all">{{ completedTx.data.memo || 'None' }}</span>
          </div>
          <div class="mb-14 form-group">
            <label>Amount</label>
            <Amount :value="completedTx.amount / 1e6" currency="XE" short sub/>
          </div>
          <div class="mb-14 form-group">
            <label>Fee</label>
            <Amount :value="0" currency="XE" short sub/>
          </div>
          <div class="mb-14 form-group">
            <label>Recipient receives</label>
            <Amount :value="completedTx.amount / 1e6" currency="XE" short sub/>
          </div>
          <div class="form-group mb-14">
            <label>Transaction hash</label>
            <HashLink to="explorer" :transaction="completedTx.hash" truncated />
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
import HashLink from '../HashLink'
import { LockOpenIcon } from '@heroicons/vue/outline'
import Modal from '../Modal'
import Radio from '../Radio'
import { helpers } from '@vuelidate/validators'
import { mapState } from 'vuex'
import { parseAmount } from '../../utils/form'
import { toMicroXe } from '@edge/wallet-utils'
import useVuelidate from '@vuelidate/core'

const memoRegexp = /^[a-zA-Z0-9\s-]{0,32}$/

export default {
  name: 'SendModal',
  components: {
    Amount,
    HashLink,
    LockOpenIcon,
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
      submitError: ''
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
    canReadySend() {
      return ![this.v$.recipient, this.v$.memo, this.v$.amount].map(f => f.$invalid).includes(true)
    },
    canSend() {
      return !this.v$.$invalid
    },
    isMaxAmountEntered() {
      return this.balance > 0 && this.amountParsed === this.balance / 1e6
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
      this.passwordError = ''

      this.completedTx = null
      this.submitError = ''

      this.v$.$reset()
    },
    async send() {
      this.passwordError = ''

      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return
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
      try {
        const { metadata, results } = await xe.tx.createTransactions(process.env.VUE_APP_BLOCKCHAIN_API_URL, [tx])
        if (metadata.accepted) {
          this.completedTx = results[0]
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
