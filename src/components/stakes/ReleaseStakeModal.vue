<template>
  <div>
    <Modal :close="cancel" :visible="visible && step === 1">
      <template v-slot:header>
        <h2 class="mb-8">Release Stake<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>

      <template v-slot:body>
        <div class="pb-14">
          <div class="form-group mb-14">
            <label>Stake ID</label>
            <span class="flex w-full overflow-hidden text-white overflow-ellipsis">
              <a
                class="text-lg text-white underline"
                :href="explorerStakeUrl"
                target="_blank"
              >
                {{ stakeShortId }}
              </a>
              <!-- eslint-disable-next-line max-len -->
              <svg class="w-20 h-20 mt-2 ml-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </span>
          </div>
          <div class="form-group mb-25">
            <label class="label">Stake Type</label>
            <span class="break-all text-3xl">{{ stakeTypeFormatted }}</span>
          </div>
          <div class="mb-16 form-group">
            <label>Stake amount</label>
            <Amount :value="stakeAmountParsed" currency="XE" short sub/>
          </div>
          <div class="mb-16 form-group text-3xl">
            <label>Status</label>
            <span class="break-all">{{ status }}</span>
          </div>
          <div v-if="!isUnlocked" class="mb-16 form-group text-3xl date-time">
            <label>Unlocks in</label>
            <span class="break-all">{{ unlocksInFormatted }}</span>
          </div>
          <div v-if="!isUnlocked" class="flex items-center mt-24 leading-8 text-gray">
            <!-- eslint-disable-next-line max-len -->
            <p class="mb-0">This stake has not unlocked yet. It will unlock at {{ unlocksAtTime }} on {{ unlocksAtDate }}. You can release it instantly for a {{ releasePc }}% express release fee.</p>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <form v-if="isUnlocked">
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
                  @keypress="releaseOnEnter"
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
            <button class="w-full button button--outline-success" @click="cancel">Cancel</button>
            <button
              v-if="isUnlocked"
              :disabled="!canRelease"
              @click="release"
              class="w-full button button--success"
            >
              Release stake
            </button>
            <button
              v-else
              @click="readyExpressRelease"
              class="w-full button button--success"
            >
              Express release
            </button>
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

    <Modal :close="cancel" :visible="visible && step === 2">
      <template v-slot:header>
        <h2 class="mb-8">Express Release<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>

      <template v-slot:body>
        <div class="pb-14">
          <div class="mb-16 form-group">
            <label>Stake amount</label>
            <Amount :value="stakeAmountParsed" currency="XE" short sub/>
          </div>
          <div class="mb-16 form-group text-3xl">
            <label>Express Release Fee</label>
            <Amount :value="releaseFeeParsed" currency="XE" short sub/>
          </div>
          <div class="mb-16 form-group text-3xl">
            <label>You'll receive</label>
            <Amount :value="returnAmountParsed" currency="XE" short sub/>
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
                  @keypress="releaseOnEnter"
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
            <div class="form-group" :class="{'form-group__error': v$.confirmPhrase.$error}">
              <label for="confirm-phrase">Please type '<span style="text-transform: none">{{phrase}}</span>'</label>
              <input
                type="text"
                @keypress="createOnEnter"
                autocomplete="off"
                id="confirm-phrase"
                v-model="v$.confirmPhrase.$model"
              />
              <!-- eslint-disable-next-line max-len -->
              <div class="form-group__error input-error" v-for="error of v$.confirmPhrase.$errors" :key="error.$uid">{{error.$message}}</div>
            </div>
          </form>
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="goto(1)">Back</button>
            <button
              :disabled="!canRelease"
              @click="release"
              class="w-full button button--success"
            >Release stake</button>
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
        <h2 class="mb-8">Release requested<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>

      <template v-slot:body>
        <div class="pb-14">
          <div class="pb-4 mb-20 border-b border-gray-700 decor-block border-opacity-30">
            <!-- <CheckIcon class="w-52 text-green"/> -->
          </div>
          <div class="form-group mb-25">
            <label class="label">Stake Type</label>
            <span class="break-all text-3xl">{{ stakeTypeFormatted }}</span>
          </div>
          <div class="form-group mb-25">
            <label class="label">Stake Amount</label>
            <Amount :value="stakeAmountParsed" currency="XE" short sub/>
          </div>
          <div class="mb-16 form-group">
            <label>Fee</label>
            <Amount :value="releaseFeeParsed" currency="XE" short sub/>
          </div>
          <div class="mb-16 form-group text-3xl">
            <label>You'll receive</label>
            <Amount :value="returnAmountParsed" currency="XE" short sub/>
          </div>
          <div class="form-group mb-14">
            <label>Transaction hash</label>
            <span class="flex w-full overflow-hidden text-white overflow-ellipsis">
              <a
                class="text-lg text-white underline"
                :href="explorerTxUrl"
                target="_blank"
              >
                {{ completedTxShortHash }}
              </a>
              <!-- eslint-disable-next-line max-len -->
              <svg class="w-20 h-20 mt-2 ml-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
            </span>
          </div>
          <div class="flex items-center mt-24 leading-8 text-gray">
            <!-- eslint-disable-next-line max-len -->
            <p class="mb-0">Your transaction has been submitted. Once processed, your stake will be released (minus any fees). This may take a minute or two.</p>
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
import Modal from '../Modal'
import { mapState } from 'vuex'
import useVuelidate from '@vuelidate/core'

const confirmPhrase = 'I confirm I am willing to burn 25% to release early'
const matchConfirmPhrase = validation.caseInsensitive(confirmPhrase, 'Confirmation phrase does not match.')

export default {
  name: 'ReleaseStakeModal',
  components: {
    Amount,
    LockOpenIcon,
    Modal
  },
  props: {
    close: Function,
    stake: Object,
    visible: Boolean
  },
  data() {
    return {
      step: 1,

      iSecondsUntilUnlock: null,
      secondsUntilUnlock: null,

      password: '',
      passwordError: '',
      confirmPhrase: '',

      phrase: confirmPhrase,

      completedTx: null,
      submitError: '',

      vars: null
    }
  },
  computed: {
    ...mapState(['address', 'nextNonce']),
    canRelease() {
      if (this.isUnlocked) return !this.v$.password.$invalid
      else return !this.v$.$invalid
    },
    completedTxShortHash() {
      if (this.completedTx === null) return ''
      return [
        this.completedTx.hash.substring(0, 6),
        this.completedTx.hash.substring(this.completedTx.hash.length - 4)
      ].join('...')
    },
    explorerStakeUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/stake/${this.stake.id}`
    },
    explorerTxUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/transaction/${this.completedTx.hash}`
    },
    isUnlocked() {
      return this.unlocksAt < Date.now()
    },
    releaseFeeParsed() {
      return this.stake.amount * this.vars.stake_express_release_fee / 1e6
    },
    releasePc() {
      if (this.isUnlocked) return 0
      else return this.vars.stake_express_release_fee * 100
    },
    returnAmountParsed() {
      return this.stakeAmountParsed - this.releaseFeeParsed
    },
    stakeAmountParsed() {
      return this.stake.amount / 1e6
    },
    stakeShortId() {
      if (this.stake === null) return ''
      return [
        this.stake.id.substring(0, 6),
        this.stake.id.substring(this.stake.id.length - 4)
      ].join('...')
    },
    stakeTypeFormatted() {
      return this.stake.type[0].toUpperCase() + this.stake.type.slice(1)
    },
    status() {
      if (this.isUnlocked) return 'Unlocked'
      else return 'Unlocking'
    },
    unlocksAt() {
      if (this.stake) return this.stake.unlockRequested + this.stake.unlockPeriod
      else return null
    },
    unlocksAtDate() {
      const unlockDate = new Date(this.unlocksAt)
      return unlockDate.toLocaleString().split(', ')[0]
    },
    unlocksAtTime() {
      const unlockDate = new Date(this.unlocksAt)
      return unlockDate.toLocaleString().split(', ')[1]
    },
    unlocksInFormatted() {
      const d = Math.floor(this.secondsUntilUnlock / (3600*24))
      const h = Math.floor(this.secondsUntilUnlock % (3600*24) / 3600)
      const m = Math.floor(this.secondsUntilUnlock % 3600 / 60)
      const s = Math.floor(this.secondsUntilUnlock % 60)

      const dDisplay = d > 0 ? d + 'd ' : ''
      const hDisplay = dDisplay != '' ? this.padTime(h) + 'h ' : this.padTime(h) > 0 ? this.padTime(h) + 'h ' : ''
      const mDisplay = hDisplay != '' ? this.padTime(m) + 'm ' : this.padTime(m) > 0 ? this.padTime(m) + 'm ' : ''
      const sDisplay = this.padTime(s) + 's'

      return dDisplay + hDisplay + mDisplay + sDisplay
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
    async getXeVars() {
      this.vars = await xe.vars(process.env.VUE_APP_BLOCKCHAIN_API_URL)
    },
    goto(step) {
      this.step = step
    },
    padTime(num) {
      if (num < 10) return '0' + num
      else return num
    },
    readyExpressRelease() {
      this.goto(2)
    },
    reset() {
      this.goto(1)

      this.password = ''
      this.passwordError = ''
      this.confirmPhrase = ''

      this.v$.$reset()
    },
    async release() {
      this.passwordError = ''

      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return
      const privateKey = await storage.getPrivateKey(this.password)

      // create tx
      const tx = xe.tx.sign({
        timestamp: Date.now(),
        sender: this.address,
        recipient: this.address,
        amount: 0,
        data: {
          action: 'release_stake',
          memo: 'Release Stake',
          stake: this.stake.hash,
          express: !this.isUnlocked
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
    releaseOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.release()
    },
    updateSecondsUntilUnlock() {
      this.secondsUntilUnlock = Math.floor((this.unlocksAt - Date.now()) / 1000)
      if (this.isUnlocked) {
        clearInterval(this.iSecondsUntilUnlock)
      }
    }
  },
  mounted() {
    this.getXeVars()
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  validations() {
    return {
      password: [validation.passwordRequired],
      confirmPhrase: [
        validation.required,
        matchConfirmPhrase
      ]
    }
  },
  watch: {
    visible(v, oldv) {
      if (v === oldv) return
      if (v) {
        this.$store.dispatch('refresh')
        this.getXeVars()
      }
    },
    stake() {
      if (this.iSecondsUntilUnlock) {
        clearInterval(this.iSecondsUntilUnlock)
      }
      if (!this.isUnlocked) {
        this.updateSecondsUntilUnlock()
        this.iSecondsUntilUnlock = setInterval(this.updateSecondsUntilUnlock, 1000)
      }
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
