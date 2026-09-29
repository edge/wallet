<template>
  <div>
    <Modal :close="cancel" :visible="visible && step === 1">
      <template v-slot:header>
        <h2 class="mb-8">Claim $XE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
        <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="balance / 1e6" currency="$EDGE"/> available
        </span>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-410">
          <p class="mb-14 text-gray">Claim $XE on the new XE network, 1 $XE for each $EDGE.</p>
          <div class="form-group" :class="{'form-group__error': v$.xeAddress.$error}">
            <label for="claim-xe-address" class="label">XE ADDRESS</label>
            <input
              id="claim-xe-address"
              type="text"
              autocomplete="off"
              spellcheck="false"
              placeholder="Your new XE address (64 characters)"
              v-model="v$.xeAddress.$model"
            />
            <div class="form-group__error input-error" v-for="error of v$.xeAddress.$errors" :key="error.$uid">{{error.$message}}</div>
          </div>
          <div class="lg-input-group" :class="{'form-group__error': v$.amount.$error}">
            <label for="claim-amount">AMOUNT</label>
            <div class="relative input-wrap">
              <input
                type="text"
                id="claim-amount"
                placeholder="0.00"
                v-model="v$.amount.$model"
                class="placeholder-white placeholder-opacity-100"
              />
              <span class="absolute right-0 text-xl currentColor top-23">$EDGE</span>
              <div class="mt-5 form-group__error input-error" style="color: #CD5F4E" v-for="error of v$.amount.$errors" :key="error.$uid">{{error.$message}}</div>
            </div>
          </div>
          <div class="flex flex-wrap pt-12 radio-list">
            <Radio name="claim-amount-max" id="claim-max" label="MAX" :selected="isMaxAmountEntered" @click="setMaxAmount" />
          </div>
          <label class="claim-check">
            <input type="checkbox" v-model="v$.checked.$model" />
            <span>I have checked this XE address, and I have the recovery phrase for it.</span>
          </label>
          <div v-if="infoError" class="claim-box claim-box--error">{{ infoError }}</div>

          <div v-if="claims.length" class="claim-history">
            <label class="label">Your claims</label>
            <div v-for="c in claims" :key="c.ref" class="claim-history__item">
              <span><Amount :value="c.amount / 1e6" currency="$EDGE" short/></span>
              <span class="text-gray">{{ formatDate(c.createdAt) }}</span>
              <span :class="statusClass(c)">{{ statusText(c) }}</span>
              <button v-if="isFailed(c)" class="claim-history__retry" @click="retryFrom(c)">Retry</button>
              <span v-else></span>
            </div>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="cancel">Cancel</button>
            <button class="w-full button button--success" :disabled="!canContinue" @click="readyClaim">Continue</button>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 2">
      <template v-slot:header>
        <h2 class="mb-8">Claim $XE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
        <span class="sub-heading d-block text-gray text-caption">
          <Amount :value="balance / 1e6" currency="$EDGE"/> available
        </span>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-410">
          <div class="form-group mb-14 text-xl">
            <label class="label">XE address</label>
            <span class="break-all">{{ xeAddressNormalised }}</span>
          </div>
          <div class="mb-16 form-group">
            <label>You send</label>
            <Amount :value="amountParsed" currency="$EDGE" short sub/>
          </div>
          <div class="mb-16 form-group">
            <label>You claim</label>
            <Amount :value="amountParsed" currency="$XE" short sub/>
          </div>
          <div class="form-group mb-14">
            <label class="label">Claims wallet</label>
            <HashLink to="explorer" :wallet="info && info.claimsAddress" />
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <form>
            <div class="form-group" :class="{'form-group__error': v$.password.$error || (passwordError && !v$.password.$dirty)}">
              <label for="claim-pass">Enter Password</label>
              <div class="relative input-wrap">
                <span class="icon">
                  <LockOpenIcon/>
                </span>
                <input
                  type="password"
                  autocomplete="off"
                  @keypress="claimOnEnter"
                  placeholder="Your password"
                  id="claim-pass"
                  v-model="v$.password.$model"
                />
              </div>
              <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">{{error.$message}}</div>
              <div class="form-group__error input-error" v-if="passwordError && !v$.password.$dirty">{{passwordError}}</div>
            </div>
          </form>
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="() => goto(1)">Back</button>
            <button :disabled="!canClaim || submitting" @click="claim" class="w-full button button--success">Confirm claim</button>
          </div>
          <div v-if="submitError" class="claim-box claim-box--error">{{ submitError }}</div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 3">
      <template v-slot:header>
        <h2 class="mb-8">{{ progressTitle }}<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-410" v-if="active">
          <div class="claim-progress">
            <div class="claim-progress__bar" :class="{'claim-progress__bar--failed': failed}" :style="{ width: `${failed ? 100 : progress.percent}%` }"></div>
          </div>
          <ol class="claim-stages">
            <li :class="stageClass('posted')">Transfer posted</li>
            <li :class="stageClass('in_block')">In a block<span v-if="progress.stage === 'in_block'"> ({{ progress.confirmations }} of {{ required }} confirmations)</span></li>
            <li :class="stageClass('confirmed')">{{ required }}+ confirmations</li>
            <li :class="stageClass('received')">Received by the claims service</li>
          </ol>

          <div v-if="failed" class="claim-box claim-box--error">
            The transfer was not processed, so your $EDGE did not move. You can try again.
          </div>
          <div v-else-if="progress.stage === 'received'" class="claim-box">
            Your claim is received. Your $XE is sent to your XE address after approval.
          </div>
          <div v-else class="claim-box">
            You can leave this page: your claim continues without it. Keep the page open to follow it here.
          </div>

          <div class="mt-20 form-group mb-14">
            <label>Amount</label>
            <Amount :value="active.amount / 1e6" currency="$EDGE" short sub/>
          </div>
          <div class="form-group mb-14">
            <label>Transaction hash</label>
            <HashLink to="explorer" :transaction="active.hash" truncated />
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-40 pb-40 border-t border-gray-700 border-opacity-30">
          <div v-if="failed" class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="cancel">Close</button>
            <button class="w-full button button--success" @click="tryAgain">Try again</button>
          </div>
          <button v-else @click="cancel" class="block w-full mx-auto text-center button button--success md:w-1/2">Close</button>
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
import { LockOpenIcon } from '@heroicons/vue/outline'
import Modal from '../Modal.vue'
import Radio from '../Radio.vue'
import { helpers } from '@vuelidate/validators'
import { mapState } from 'vuex'
import { parseAmount } from '../../utils/form'
import useVuelidate from '@vuelidate/core'
import {
  MISSES_TO_FAIL, STAGES, claimFailed, claimProgress, clearActiveClaim, createClaim, fetchClaim, fetchClaims,
  fetchClaimsInfo, loadActiveClaim, loadFailedRefs, markClaimFailed, newXeAddressRegexp, normaliseXeAddress,
  saveActiveClaim
} from '../../utils/claim'

const POLL_MS = 5000

export default {
  name: 'ClaimModal',
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

      info: null,
      infoError: '',
      claims: [],
      failedRefs: [],

      xeAddress: '',
      amount: '',
      checked: false,
      password: '',
      passwordError: '',
      submitError: '',
      submitting: false,

      active: null,
      progress: { stage: 'posted', confirmations: 0, percent: 15 },
      misses: 0,
      failed: false,
      pollTimer: null
    }
  },
  validations() {
    return {
      xeAddress: [
        validation.required,
        helpers.withMessage(
          'Enter your new XE address: 64 characters, 0-9 and a-f. An Edge address (xe_...) does not work.',
          v => newXeAddressRegexp.test(normaliseXeAddress(v))
        )
      ],
      amount: [
        validation.required,
        ...validation.amount(this.balance, this.amountParsed),
        helpers.withParams({ p: this.amountParsed }, helpers.withMessage(
          () => `The minimum claim is ${this.minAmount / 1e6} $EDGE.`,
          () => this.amountParsed >= this.minAmount / 1e6
        ))
      ],
      checked: [helpers.withMessage('Confirm that you checked the address.', v => v === true)],
      password: [validation.passwordRequired]
    }
  },
  computed: {
    ...mapState(['address', 'balance', 'nextNonce']),
    amountParsed() {
      return parseAmount(this.amount)
    },
    xeAddressNormalised() {
      return normaliseXeAddress(this.xeAddress)
    },
    minAmount() {
      return this.info ? this.info.minAmount : 1e6
    },
    required() {
      return this.info ? this.info.confirmations : 10
    },
    canContinue() {
      return !!this.info && ![this.v$.xeAddress, this.v$.amount, this.v$.checked].map(f => f.$invalid).includes(true)
    },
    canClaim() {
      return !this.v$.$invalid
    },
    isMaxAmountEntered() {
      return this.balance > 0 && this.amountParsed === this.balance / 1e6
    },
    progressTitle() {
      if (this.failed) return 'Claim failed'
      if (this.progress.stage === 'received') return 'Claim received'
      return 'Claim in progress'
    }
  },
  watch: {
    visible(v, oldv) {
      if (v === oldv) return
      if (v) this.open()
      else this.stopPolling()
    }
  },
  unmounted() {
    this.stopPolling()
  },
  methods: {
    async open() {
      this.$store.dispatch('refresh')
      this.active = loadActiveClaim(this.address)
      if (this.active) {
        this.goto(3)
        this.startPolling()
      }
      try {
        this.info = await fetchClaimsInfo()
        this.infoError = this.info.open ? '' : 'Claims are closed.'
        if (!this.info.open) this.info = null
      }
      catch (err) {
        this.infoError = 'The claims service is not available. Try again later.'
      }
      this.loadClaims()
    },
    async loadClaims() {
      this.failedRefs = loadFailedRefs(this.address)
      try {
        this.claims = (await fetchClaims(this.address)).slice(0, 5)
      }
      catch (err) {
        this.claims = []
      }
    },
    cancel() {
      this.stopPolling()
      if (this.active && (this.failed || this.progress.stage === 'received')) clearActiveClaim(this.active.sender)
      this.reset()
      this.close()
    },
    goto(step) {
      this.step = step
    },
    reset() {
      this.goto(1)
      this.xeAddress = ''
      this.amount = ''
      this.checked = false
      this.password = ''
      this.passwordError = ''
      this.submitError = ''
      this.submitting = false
      this.active = null
      this.progress = { stage: 'posted', confirmations: 0, percent: 15 }
      this.misses = 0
      this.failed = false
      this.v$.$reset()
    },
    readyClaim() {
      const fields = [this.v$.xeAddress, this.v$.amount, this.v$.checked]
      fields.forEach(f => f.$touch())
      if (fields.map(f => f.$error).includes(true)) return
      this.goto(2)
    },
    async checkPassword() {
      this.v$.password.$reset()
      if (await storage.comparePassword(this.password)) {
        this.passwordError = ''
        return true
      }
      this.passwordError = 'Incorrect password.'
      return false
    },
    async claim() {
      this.passwordError = ''
      this.submitError = ''
      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return

      this.submitting = true
      try {
        const privateKey = await storage.getPrivateKey(this.password)
        const claim = await createClaim(this.address, this.xeAddressNormalised, xe.xe.toMxe(this.amountParsed))

        await this.$store.dispatch('refresh')
        const nonce = this.nextNonce
        const tx = xe.tx.sign({
          timestamp: Date.now(),
          sender: this.address,
          recipient: claim.claimsAddress,
          amount: claim.amount,
          data: { memo: claim.memo, ref: claim.ref },
          nonce
        }, privateKey)

        const { metadata, results } = await xe.tx.createTransactions(import.meta.env.VITE_BLOCKCHAIN_API_URL, [tx])
        if (!metadata.accepted) {
          this.submitError = results[0].reason
          return
        }

        this.active = {
          sender: this.address,
          ref: claim.ref,
          hash: results[0].hash,
          nonce,
          amount: claim.amount,
          xeAddress: this.xeAddressNormalised,
          createdAt: Date.now()
        }
        saveActiveClaim(this.address, this.active)
        this.goto(3)
        this.startPolling()
      }
      catch (err) {
        console.error(err)
        this.submitError = err.message
      }
      finally {
        this.submitting = false
      }
    },
    claimOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.claim()
    },
    startPolling() {
      this.stopPolling()
      const tick = async () => {
        await this.pollClaim()
        if (this.visible && !this.failed && this.progress.stage !== 'received') {
          this.pollTimer = setTimeout(tick, POLL_MS)
        }
      }
      tick()
    },
    stopPolling() {
      clearTimeout(this.pollTimer)
      this.pollTimer = null
    },
    async pollClaim() {
      const host = import.meta.env.VITE_BLOCKCHAIN_API_URL
      const { hash, nonce, ref, sender } = this.active
      try {
        const [chainTx, pendingTxs, walletInfo, claim] = await Promise.all([
          fetch(`${host}/transaction/${hash}`).then(res => res.ok ? res.json() : null),
          xe.tx.pendingTransactions(host, sender),
          xe.wallet.info(host, sender),
          fetchClaim(ref).catch(() => null)
        ])
        const progress = claimProgress({
          chainTx,
          pending: pendingTxs.some(t => t.hash === hash),
          walletNonce: walletInfo.nonce,
          txNonce: nonce,
          claim,
          required: this.required
        })

        if (progress.stage === 'missing') {
          this.misses++
          if (this.misses >= MISSES_TO_FAIL) this.setFailed()
          return
        }
        this.misses = 0
        if (progress.stage === 'failed') {
          this.setFailed()
          return
        }
        this.progress = progress
      }
      catch (err) {
        // Network trouble: keep the last known state and check again.
        console.error('Claim check failed:', err)
      }
    },
    setFailed() {
      this.failed = true
      markClaimFailed(this.active.sender, this.active.ref)
    },
    tryAgain() {
      const { amount, sender, xeAddress } = this.active
      clearActiveClaim(sender)
      this.reset()
      this.amount = (amount / 1e6).toString()
      this.xeAddress = xeAddress
      this.loadClaims()
    },
    retryFrom(claim) {
      this.amount = (claim.amount / 1e6).toString()
    },
    setMaxAmount() {
      this.amount = (this.balance / 1e6).toFixed(6)
    },
    stageClass(stage) {
      const current = STAGES.indexOf(this.progress.stage)
      const index = STAGES.indexOf(stage)
      if (this.failed) return index === 0 ? 'claim-stage--failed' : ''
      if (index < current || this.progress.stage === 'received') return 'claim-stage--done'
      if (index === current) return 'claim-stage--current'
      return ''
    },
    isFailed(claim) {
      return claimFailed(claim, this.failedRefs)
    },
    statusClass(claim) {
      if (this.isFailed(claim)) return 'claim-status--failed'
      return claim.status === 'received' ? 'claim-status--received' : ''
    },
    statusText(claim) {
      if (this.isFailed(claim)) return 'Failed'
      if (claim.status === 'awaiting_transfer') return 'Waiting for transfer'
      if (claim.processed) return 'Paid'
      if (claim.approved) return 'Approved'
      return claim.review.length ? 'Received, in review' : 'Received'
    },
    formatDate(date) {
      return new Date(date).toLocaleDateString()
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

.claim-check {
  @apply flex items-start mt-20 cursor-pointer text-gray;
  gap: 10px;
  font-size: 14px;
  letter-spacing: normal;
  text-transform: none;
}

.claim-check input {
  accent-color: #0ecc5f;
  margin-top: 3px;
}

.claim-box {
  @apply px-20 py-16 mt-20 text-white bg-black border border-gray-700 rounded border-opacity-30;
}

.claim-box--error {
  color: #CD5F4E;
}

.claim-history {
  @apply mt-24;
}

.claim-history__item {
  @apply grid items-center py-8 border-b border-gray-700 border-opacity-30;
  grid-template-columns: 1fr 1fr 1fr 48px;
  gap: 12px;
}

.claim-history__item > :nth-child(3),
.claim-history__item > :nth-child(4) {
  @apply text-right;
}

.claim-history__item :deep(.currency) {
  margin-left: 4px;
}

.claim-history__retry {
  @apply text-green underline;
}

.claim-status--received {
  color: #0ecc5f;
}

.claim-status--failed {
  color: #CD5F4E;
}

.claim-progress {
  @apply w-full mb-20 overflow-hidden bg-gray-700 rounded;
  height: 8px;
}

.claim-progress__bar {
  height: 100%;
  background: #0ecc5f;
  transition: width 0.5s ease;
}

.claim-progress__bar--failed {
  background: #CD5F4E;
}

.claim-stages li {
  @apply py-4 text-gray;
}

.claim-stages li::before {
  content: '○';
  @apply mr-8;
}

.claim-stages li.claim-stage--done {
  @apply text-white;
}

.claim-stages li.claim-stage--done::before {
  content: '●';
  color: #0ecc5f;
}

.claim-stages li.claim-stage--current {
  @apply text-white;
}

.claim-stages li.claim-stage--current::before {
  content: '◐';
  color: #0ecc5f;
}

.claim-stages li.claim-stage--failed::before {
  content: '✕';
  color: #CD5F4E;
}
</style>
