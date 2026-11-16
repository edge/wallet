<template>
  <div class="connect">
    <Modal :visible="true">
      <template v-slot:header>
        <h2 class="mb-8 break-all">{{ origin || 'Edge Wallet' }} <span v-if="network === 'testnet'">(Testnet)</span></h2>
        <p v-if="step === 'unlock' || step === 'connect'" class="text-gray">Wants to see your Edge address and balance</p>
      </template>
      <template v-slot:body>
        <div class="pb-14">
          <p v-if="step === 'waiting'" class="text-gray">Waiting for the site's request.</p>
          <p v-else-if="step === 'no-opener'" class="text-gray">Sites open this page to connect to your wallet. Nothing is waiting here.</p>
          <div v-else-if="step === 'no-wallet'">
            <p class="text-gray">No wallet in this browser yet.</p>
            <button class="button button--success w-full" @click="openWallet">Set up the wallet</button>
            <p class="mt-14 text-gray">Set up your wallet in its own tab, then come back and connect again.</p>
          </div>
          <div v-else-if="step === 'connect'">
            <label class="label">Account</label>
            <div role="radiogroup" class="connect-accounts">
              <button v-for="wallet in wallets" :key="wallet.id" type="button" role="radio"
                :aria-checked="wallet.id === selectedId" class="connect-account"
                :class="{'connect-account--active': wallet.id === selectedId}" :disabled="busy" @click="selectedId = wallet.id">
                <strong>{{ wallet.name }}</strong>
                <span class="block break-all text-sm2">{{ wallet.address }}</span>
              </button>
            </div>
            <p class="mt-14 text-gray">Connecting shares your address and balance. It does not send EDGE.</p>
          </div>
          <div v-else-if="step === 'review' || step === 'sending'">
            <div class="form-group mb-14"><label>Send</label><span class="connect-amount">{{ amount }} EDGE</span></div>
            <div class="form-group mb-14"><label>From</label><span class="break-all text-sm2">{{ params.from }}</span></div>
            <div class="form-group mb-14"><label>To</label><span class="break-all text-sm2">{{ params.recipient }}</span></div>
            <div v-if="params.data.memo" class="form-group mb-14"><label>Memo</label><span class="connect-exact">{{ exactText(params.data.memo) }}</span></div>
            <div v-if="params.data.ref" class="form-group mb-14"><label>Reference</label><span class="connect-exact">{{ exactText(params.data.ref) }}</span></div>
            <template v-if="isBurn">
              <p class="connect-warning" role="alert">This EDGE will be destroyed. The wallet cannot verify the XE destination from this request. Check your claim in the burn app.</p>
              <label class="connect-check"><input type="checkbox" v-model="burnConfirmed" :disabled="busy"/>I understand this EDGE will be destroyed.</label>
            </template>
            <p class="mt-14 text-gray">No network fee.</p>
          </div>
          <form v-if="step === 'unlock' || step === 'review' || step === 'sending'" @submit.prevent="step === 'unlock' ? unlock() : send()">
            <div class="form-group" :class="{'form-group__error': passwordError}">
              <label for="connect-password">Enter password</label>
              <input id="connect-password" type="password" autocomplete="off" placeholder="Your password" v-model="password" :disabled="busy"/>
              <div v-if="passwordError" class="form-group__error input-error">{{ passwordError }}</div>
            </div>
          </form>
          <p v-if="errorText" class="connect-warning" role="alert">{{ errorText }}</p>
        </div>
      </template>
      <template v-slot:footer>
        <div class="px-24 pt-24 pb-30 border-t border-gray-700 border-opacity-30">
          <div v-if="['unlock', 'connect', 'review', 'sending'].includes(step)" class="grid grid-cols-2 gap-16">
            <button class="button button--outline-success w-full" :disabled="busy" @click="decline">Cancel</button>
            <button v-if="step === 'unlock'" class="button button--success w-full" :disabled="busy || !password" @click="unlock">Unlock</button>
            <button v-else-if="step === 'connect'" class="button button--success w-full" :disabled="busy || !armed || !selectedId" @click="connect">Connect</button>
            <button v-else class="button button--success w-full" :disabled="busy || !armed || !password || (isBurn && !burnConfirmed)" @click="send">{{ busy ? 'Sending' : 'Send' }}</button>
          </div>
          <button v-else class="button button--outline-success w-full" @click="closeWindow">Close</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
import * as storage from '../utils/storage'
import * as xe from '@edge/xe-utils'
import Modal from '../components/Modal.vue'
import { BURN_ADDRESS, ConnectError, ERRORS, checkBalance, exactText, preflight, saveSite, startSession, walletNetwork } from '../utils/edge-connect'

// Jakub's connect flow arms approval half a second after the step appears or regains focus.
const ARM_DELAY_MS = 500
// The Edge blockchain API reports an already-present transaction with status 302.
const TRANSACTION_EXISTS_STATUS = 302

export default {
  name: 'ViewConnect',
  title: 'Connect',
  components: { Modal },
  data() {
    return {
      session: null, request: null, step: 'waiting', origin: '', params: null, network: walletNetwork(),
      wallets: [], selectedId: null, password: '', passwordError: '', errorText: '', busy: false,
      armed: false, armTimer: null, burnConfirmed: false
    }
  },
  computed: {
    isBurn() {
      return this.params && this.params.recipient === BURN_ADDRESS
    },
    amount() {
      return this.params ? (this.params.amount / 1e6).toLocaleString('en-US', { maximumFractionDigits: 6 }) : ''
    },
    baseURL() {
      return this.$store.state.config.blockchain.baseURL
    }
  },
  watch: {
    step() {
      this.arm()
    }
  },
  mounted() {
    this.session = startSession(window, {
      onRequest: request => this.receive(request),
      onBadOrigin: () => {
        this.errorText = 'This page cannot connect to an insecure or unknown site.'
        this.step = 'error'
      }
    })
    if (!this.session) this.step = 'no-opener'
    window.addEventListener('focus', this.arm)
  },
  beforeUnmount() {
    if (this.session) this.session.stop()
    window.removeEventListener('focus', this.arm)
    clearTimeout(this.armTimer)
    this.password = ''
  },
  methods: {
    exactText,
    arm() {
      this.armed = false
      clearTimeout(this.armTimer)
      this.armTimer = setTimeout(() => {
        this.armed = true
      }, ARM_DELAY_MS)
    },
    receive(request) {
      this.origin = request.origin
      this.request = request
      try {
        this.params = preflight(request, this.network)
        if (!this.$store.state.hasWallet) this.step = 'no-wallet'
        else this.step = request.method === 'edge_requestAccounts' ? 'unlock' : 'review'
      }
      catch (err) {
        this.fail(err)
      }
    },
    openWallet() {
      window.open(`${window.location.origin}/`, '_blank', 'noopener,noreferrer')
    },
    closeWindow() {
      window.close()
    },
    decline() {
      this.session.fail(ERRORS.declined, 'The person declined.')
      window.close()
    },
    fail(err, extra = {}) {
      this.errorText = err.message || 'The wallet could not complete the request.'
      this.step = 'error'
      this.session.fail(err instanceof ConnectError ? err.code : ERRORS.internal, this.errorText, extra)
    },
    async accounts(password) {
      const version = await storage.getWalletVersion()
      if (!await storage.comparePassword(password, version)) return null
      const wallets = version === 2 ? await storage.getWallets(password) : [{
        id: 'wallet', name: 'Wallet 1', address: await storage.getAddress(password, version)
      }]
      if (!wallets.length) throw new Error('No account is available. Open the Edge Wallet and try again.')
      return { version, wallets }
    },
    async unlock() {
      if (this.busy || !this.password) return
      this.busy = true
      this.passwordError = ''
      try {
        const unlocked = await this.accounts(this.password)
        if (!unlocked) {
          this.passwordError = 'Incorrect password.'
          return
        }
        this.wallets = unlocked.wallets
        this.selectedId = this.wallets[0].id
        this.step = 'connect'
      }
      catch (err) {
        this.fail(err)
      }
      finally {
        this.password = ''
        this.busy = false
      }
    },
    async connect() {
      if (this.busy || !this.armed || this.session.answered || this.session.openerGone) return
      const wallet = this.wallets.find(w => w.id === this.selectedId)
      if (!wallet) return
      this.busy = true
      this.errorText = ''
      try {
        const info = await xe.wallet.infoWithNextNonce(this.baseURL, wallet.address)
        checkBalance(0, info.balance)
        if (info.address !== wallet.address || !Number.isSafeInteger(info.nonce) || info.nonce < 0) throw new Error('The blockchain returned invalid account information.')
        if (this.session.answered || this.session.openerGone) return
        saveSite(this.origin, wallet.address, this.network)
        this.session.respond({ address: wallet.address, network: this.network, balance: info.balance, nonce: info.nonce })
      }
      catch (err) {
        this.errorText = err.message
      }
      finally {
        this.busy = false
      }
    },
    async send() {
      if (this.busy || !this.armed || !this.password || (this.isBurn && !this.burnConfirmed) || this.session.answered || this.session.openerGone) return
      this.busy = true
      this.passwordError = ''
      const password = this.password
      try {
        this.params = preflight(this.request, this.network)
        const unlocked = await this.accounts(password)
        if (!unlocked) {
          this.passwordError = 'Incorrect password.'
          return
        }
        const { from, recipient, amount, data } = this.params
        const wallet = unlocked.wallets.find(w => w.address === from)
        if (!wallet) throw new ConnectError(ERRORS.notConnected, 'This account is no longer in this wallet. Connect again.')
        const info = await xe.wallet.infoWithNextNonce(this.baseURL, from)
        checkBalance(amount, info.balance)
        if (info.address !== from || !Number.isSafeInteger(info.nonce) || info.nonce < 0) throw new Error('The blockchain returned invalid account information.')
        const key = unlocked.version === 2 ? await storage.getWalletPrivateKey(password, wallet.id) : await storage.getPrivateKey(password, unlocked.version)
        if (!key || xe.wallet.deriveAddressFromPrivateKey(key) !== from) throw new Error('The stored key does not match this account.')
        if (this.session.answered || this.session.openerGone) return
        const tx = xe.tx.sign({ timestamp: Date.now(), sender: from, recipient, amount, data, nonce: info.nonce }, key)
        const hash = xe.tx.hash(tx).hash
        this.step = 'sending'
        this.session.submitting(hash)
        let response
        try {
          response = await xe.tx.createTransactions(this.baseURL, [tx])
        }
        catch (err) {
          this.fail(new Error(`Submission could not be confirmed: ${err.message}. Check the transaction before trying again.`), { uncertain: true, hash })
          return
        }
        const result = response && response.results && response.results[0]
        if (!response || !response.metadata || !response.metadata.accepted || !result || !result.success) {
          this.fail(new Error((result && result.reason) || 'The blockchain did not confirm acceptance. Check the transaction before trying again.'), {
            uncertain: !(result && result.success === false && result.status !== TRANSACTION_EXISTS_STATUS), hash
          })
          return
        }
        this.session.respond({ hash, nonce: tx.nonce, timestamp: tx.timestamp })
      }
      catch (err) {
        this.fail(err)
      }
      finally {
        this.password = ''
        this.busy = false
      }
    }
  }
}
</script>

<style scoped>
.connect { @apply min-h-screen bg-black text-white; }
.connect-accounts { @apply grid gap-10; }
.connect-account { @apply w-full p-14 text-left border border-gray-700 rounded-md; }
.connect-account--active { @apply border-green; }
.connect-amount { @apply block text-xl; }
.connect-exact { @apply block break-all font-mono text-sm2; white-space: pre-wrap; }
.connect-warning { @apply p-14 border border-gray-700 rounded-md mb-14; }
.connect-check { @apply flex items-start gap-10; }
</style>
