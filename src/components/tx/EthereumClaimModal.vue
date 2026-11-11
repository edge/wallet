<template>
  <div>
    <Modal :close="cancel" :visible="visible && !creatingAddress">
      <template v-slot:header>
        <h2 class="mb-8">{{ step === 3 ? statusTitle : 'Claim $XE from Ethereum' }}</h2>
        <span v-if="ethereumAddress && step === 1" class="sub-heading d-block text-gray text-caption">
          <Amount :value="balanceText" currency="$EDGE"/> available
        </span>
      </template>
      <template v-slot:body>
        <div class="pb-14 min-h-410">
          <p v-if="info?.rehearsal" class="mb-20 text-gray">Local rehearsal. Test assets only; no native XE is paid.</p>
          <p v-else-if="info && step !== 3" class="mb-20 text-gray">Burn EDGE to register your claim for XE. XE delivery happens separately, after approval.</p>
          <p v-if="!info && !error" role="status">Connecting to the claims service…</p>
          <template v-if="info && step === 1">
            <p v-if="!ethereumAddress" class="text-gray">Connect your Ethereum wallet, choose where to receive XE, then review your transfer.</p>
            <template v-else>
              <div class="form-group mb-14">
                <label>Ethereum wallet</label>
                <span class="break-all text-sm2">{{ ethereumAddress }}</span>
              </div>
              <div class="form-group" :class="{'form-group__error': v$.xeAddress.$error}">
                <label for="ethereum-claim-xe-address" class="label">XE WALLET ADDRESS</label>
                <input id="ethereum-claim-xe-address" v-model="v$.xeAddress.$model" type="text" autocomplete="off" spellcheck="false" placeholder="Paste your XE wallet address" />
                <p class="mt-10 text-gray">This is where your XE will be sent after approval.</p>
                <div v-for="error of v$.xeAddress.$errors" :key="error.$uid" class="form-group__error input-error">{{ error.$message }}</div>
                <p class="mt-10 text-gray">Don't have an XE address yet? <button class="claim-link" @click="creatingAddress = true">Create one</button></p>
              </div>
              <div class="lg-input-group" :class="{'form-group__error': v$.amount.$error}">
                <label for="ethereum-claim-amount">AMOUNT</label>
                <div class="relative input-wrap">
                  <input id="ethereum-claim-amount" v-model="v$.amount.$model" type="text" inputmode="decimal" placeholder="0.00" class="placeholder-white placeholder-opacity-100" />
                  <span class="absolute right-0 text-xl currentColor top-23">$EDGE</span>
                  <div v-for="error of v$.amount.$errors" :key="error.$uid" class="mt-5 form-group__error input-error">{{ error.$message }}</div>
                </div>
              </div>
              <div class="flex flex-wrap pt-12 radio-list">
                <Radio name="ethereum-claim-amount-max" id="ethereum-claim-max" label="MAX" :selected="amount === balanceText" @click="amount = balanceText" />
              </div>
              <label class="claim-check">
                <input id="ethereum-claim-checked" v-model="v$.checked.$model" type="checkbox" />
                <span>I have checked this XE address, and I have the recovery phrase for&nbsp;it.</span>
              </label>
            </template>
          </template>
          <template v-if="info && step === 2">
            <div class="form-group mb-14 text-xl">
              <label>XE address</label>
              <span class="break-all">{{ destination }}</span>
            </div>
            <div class="form-group mb-16">
              <label>You burn</label>
              <Amount :value="amount" currency="$EDGE" short sub/>
            </div>
            <div class="form-group mb-14">
              <label>Network</label>
              <span>{{ info.chainName }}</span>
            </div>
            <div class="form-group mb-14">
              <label>Burn address</label>
              <span class="break-all">{{ ethereumBurnAddress }}</span>
            </div>
            <p class="mt-20 text-gray">Your EDGE will be permanently retired and cannot be refunded. XE delivery happens separately, after approval.</p>
            <p class="mt-20 text-gray">Your wallet will ask you to approve this EDGE transfer. You also need ETH for the network fee.</p>
          </template>
          <template v-if="info && step === 3 && active">
            <div class="claim-progress">
              <div class="claim-progress__bar" :class="{'claim-progress__bar--failed': active.status === 'transfer_failed'}" :style="{ width: `${progressPercent}%` }"></div>
            </div>
            <ol class="claim-stages">
              <li :class="stageClass('posted')">Transfer posted</li>
              <li :class="stageClass('in_block')">In a block<span v-if="active.status === 'in_block'"> ({{ active.confirmations }} of {{ info.confirmations }} confirmations)</span></li>
              <li :class="stageClass('received')">Claim recorded</li>
            </ol>
            <div class="claim-box" role="status">
              <template v-if="!burnClaim">This receipt uses a previous transfer destination. Keep it for reconciliation. Do not send another transfer for this claim.</template>
              <template v-else-if="received && active.review?.length">Your EDGE burn is confirmed. Your claim needs review before approval.</template>
              <template v-else-if="received">Your EDGE burn is confirmed. XE approval and delivery are handled separately.</template>
              <template v-else-if="active.status === 'transfer_failed'">The transfer failed. No EDGE moved in that transaction.</template>
              <template v-else-if="active.status === 'expired'">This reference has expired. Do not send again while this transfer is unresolved. Check your wallet and keep this receipt. A late transfer can still be recorded for review.</template>
              <template v-else-if="!active.hash">Confirm the transfer in your wallet. If you already approved it, wait for the claims service. Do not send again while it is unresolved.</template>
              <template v-else>You can leave this page: your claim continues without it. Keep the page open to follow it here.</template>
            </div>
            <div class="mt-20 form-group mb-14">
              <label>Amount</label>
              <Amount :value="activeAmount" currency="$EDGE" short sub/>
            </div>
            <div class="form-group mb-14">
              <label>XE address</label>
              <span class="break-all text-sm2">{{ active.xeAddress }}</span>
            </div>
            <div v-if="active.hash" class="form-group mb-14">
              <label>Transaction hash</label>
              <span class="break-all text-sm2">{{ active.hash }}</span>
            </div>
            <details class="mt-20">
              <summary>Claim receipt</summary>
              <pre class="mt-10 text-sm2 whitespace-pre-wrap break-all">{{ receiptText }}</pre>
            </details>
            <p v-if="receiptNotice" class="mt-10 text-gray" role="status">{{ receiptNotice }}</p>
            <details v-if="received && burnClaim && info.open" class="mt-20">
              <summary>Make another claim</summary>
              <p class="mt-10 text-gray">Starting another claim replaces the receipt saved in this browser. Save this receipt first.</p>
              <label class="claim-check"><input id="ethereum-receipt-saved" type="checkbox" v-model="receiptSaved" /><span>I have saved this receipt.</span></label>
              <button class="claim-link mt-10" :disabled="!receiptSaved" @click="newClaim">Start new claim</button>
            </details>
          </template>
          <div v-if="error" class="claim-box claim-box--error" role="alert">{{ error }}</div>
        </div>
      </template>
      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <div v-if="step !== 3" class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" :disabled="busy" @click="step === 2 ? back() : cancel()">{{ step === 2 ? 'Back' : 'Cancel' }}</button>
            <button v-if="step === 1 && !ethereumAddress" class="w-full button button--success" :disabled="!info || (!info.open && !active) || busy" @click="connect">{{ busy ? 'Connecting…' : 'Connect wallet' }}</button>
            <button v-else-if="step === 1" class="w-full button button--success" :disabled="!canContinue || busy" @click="step = 2">Continue</button>
            <button v-else class="w-full button button--success" :disabled="busy || !canContinue" @click="submit">{{ busy ? 'Waiting for wallet…' : 'Burn in wallet' }}</button>
          </div>
          <div v-else-if="received" class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="copyReceipt">Copy receipt</button>
            <button class="w-full button button--success" @click="cancel">Close</button>
          </div>
          <div v-else-if="active?.status === 'transfer_failed'" class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="cancel">Close</button>
            <button class="w-full button button--success" @click="newClaim">Try again</button>
          </div>
          <div v-else-if="active?.status === 'awaiting_transfer' && active.rejected && !active.hash" class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" :disabled="busy" @click="cancel">Close</button>
            <button class="w-full button button--success" :disabled="busy" @click="resume">Review transfer</button>
          </div>
          <button v-else class="block w-full mx-auto text-center button button--success md:w-1/2" :disabled="busy" @click="cancel">Close</button>
        </div>
      </template>
    </Modal>
    <XeAddressModal :visible="visible && creatingAddress" :close="() => { creatingAddress = false }" @created="useAddress" />
  </div>
</template>

<script>
import * as validation from '../../utils/validation'
import Amount from '../Amount.vue'
import Modal from '../Modal.vue'
import Radio from '../Radio.vue'
import XeAddressModal from './XeAddressModal.vue'
import { ethers } from 'ethers'
import { helpers } from '@vuelidate/validators'
import { markRaw } from 'vue'
import useVuelidate from '@vuelidate/core'
import {
  claimBalanceText, encodeClaimTransfer, ethereumBurnAddress, ethereumClaimStorageKey, ethereumClaimsRequest,
  parseClaimAmount, validateClaim, validateEthereumInfo
} from '../../utils/ethereum-claim'
import { newXeAddressRegexp, normaliseXeAddress } from '../../utils/claim'

export default {
  name: 'EthereumClaimModal',
  components: { Amount, Modal, Radio, XeAddressModal },
  props: { visible: Boolean, close: Function },
  data() {
    return {
      ethereumBurnAddress, info: null, step: 1, ethereumAddress: '', balance: '0', xeAddress: '', amount: '', checked: false,
      creatingAddress: false, busy: false, error: '', active: null, pollTimer: null, pollGeneration: 0, listening: false,
      walletProvider: null, receiptNotice: '', receiptSaved: false
    }
  },
  validations() {
    return {
      xeAddress: [validation.required, helpers.withMessage(
        'Copy the address from your XE wallet, or choose Create one. An Edge address (xe_...) does not work.',
        value => newXeAddressRegexp.test(normaliseXeAddress(value)) && !/^0+$/.test(normaliseXeAddress(value))
      )],
      amount: [validation.required, helpers.withMessage(() => this.amountError, () => !!this.amount && !this.amountError)],
      checked: [helpers.withMessage('Confirm that you checked the address.', value => value === true)]
    }
  },
  computed: {
    receiptText() {
      if (!this.active) return ''
      return `XE claim receipt\nReference: ${this.active.ref}\nNetwork: ${this.info.chainName}\nAmount: ${this.activeAmount} EDGE\nTransfer recipient: ${this.active.claimsAddress}\nFrom: ${this.active.ethereumAddress}\nXE wallet address: ${this.active.xeAddress}\nTransaction: ${this.active.hash || 'Not yet posted'}\nStatus: ${this.received ? 'Claim recorded. XE approval and delivery are handled separately.' : this.statusTitle}`
    },
    destination() {
      return normaliseXeAddress(this.xeAddress)
    },
    balanceText() {
      return claimBalanceText(this.balance)
    },
    amountError() {
      if (!this.amount) return ''
      try {
        const value = parseClaimAmount(this.amount)
        if (this.info && value.lt(this.info.minAmount)) return `Minimum claim is ${ethers.utils.formatUnits(this.info.minAmount, 18)} EDGE.`
        return value.gt(this.balance) ? 'Insufficient funds.' : ''
      }
      catch (err) {
        return err.message
      }
    },
    canContinue() {
      return !!this.info && (this.info.open || !!this.active) && !!this.ethereumAddress && !this.v$.$invalid
    },
    burnClaim() {
      return this.active?.claimsAddress?.toLowerCase() === ethereumBurnAddress.toLowerCase()
    },
    received() {
      return this.active?.status === 'received'
    },
    activeAmount() {
      return ethers.utils.formatUnits(this.active.transfer?.amount || this.active.amount, 18)
    },
    progressStage() {
      if (this.received) return 'received'
      if (this.active?.status === 'in_block') return 'in_block'
      return this.active?.hash ? 'posted' : ''
    },
    progressPercent() {
      if (this.received) return 100
      if (this.active?.status === 'transfer_failed') return 0
      if (this.progressStage === 'in_block') return Math.min(90, 30 + Math.floor(55 * this.active.confirmations / this.info.confirmations))
      return this.active?.hash ? 15 : 0
    },
    statusTitle() {
      if (this.received) return 'Claim recorded'
      if (this.active?.status === 'transfer_failed') return 'Transfer failed'
      if (this.active?.status === 'expired') return 'Claim expired'
      if (this.active?.status === 'in_block') return 'Confirming transfer'
      return this.active?.hash ? 'Claim in progress' : 'Confirm in your wallet'
    }
  },
  watch: {
    visible: {
      immediate: true,
      handler(value) {
        if (value) this.open()
        else this.stopPolling()
      }
    }
  },
  unmounted() {
    this.stopPolling()
    if (this.listening) {
      this.walletProvider?.removeListener('accountsChanged', this.accountsChanged)
      this.walletProvider?.removeListener('chainChanged', this.chainChanged)
    }
  },
  methods: {
    async open() {
      this.error = ''
      this.receiptNotice = ''
      this.receiptSaved = false
      try {
        const info = await ethereumClaimsRequest('/info')
        validateEthereumInfo(info)
        if (!this.visible) return
        this.info = info
        const saved = localStorage.getItem(ethereumClaimStorageKey())
        if (saved) {
          this.active = JSON.parse(saved)
          this.step = 3
          validateClaim(this.active, info, this.active)
          this.startPolling()
        }
        else if (!info.open) throw new Error('Claims are closed.')
      }
      catch (err) {
        this.error = err.message
      }
    },
    async connect() {
      this.error = ''
      this.busy = true
      try {
        const provider = window.ethereum
        if (this.listening) {
          this.walletProvider.removeListener('accountsChanged', this.accountsChanged)
          this.walletProvider.removeListener('chainChanged', this.chainChanged)
          this.listening = false
        }
        this.walletProvider = provider ? markRaw(provider) : null
        if (!provider?.request) throw new Error('Open this page in a browser with an Ethereum wallet installed.')
        const accounts = await provider.request({ method: 'eth_requestAccounts' })
        if (await provider.request({ method: 'eth_chainId' }) !== this.info.chainId) {
          try {
            await provider.request({ method: 'wallet_switchEthereumChain', params: [{ chainId: this.info.chainId }] })
          }
          catch (err) {
            if (err.code === 4902) throw new Error(`Add ${this.info.chainName} in your wallet, then connect again.`)
            throw err
          }
        }
        this.ethereumAddress = accounts[0] || ''
        await this.checkWallet()
        if (!this.listening && provider.on) {
          provider.on('accountsChanged', this.accountsChanged)
          provider.on('chainChanged', this.chainChanged)
          this.listening = true
        }
        await this.refreshBalance()
      }
      catch (err) {
        this.ethereumAddress = ''
        this.error = err.message
      }
      finally {
        this.busy = false
      }
    },
    async checkWallet() {
      const provider = this.walletProvider
      const chain = await provider.request({ method: 'eth_chainId' })
      const accounts = await provider.request({ method: 'eth_accounts' })
      if (chain !== this.info.chainId || accounts[0]?.toLowerCase() !== this.ethereumAddress.toLowerCase()) {
        throw new Error('The wallet account or network changed. Connect again before sending.')
      }
      const code = await provider.request({ method: 'eth_getCode', params: [this.info.tokenAddress, 'latest'] })
      if (ethers.utils.keccak256(code) !== this.info.tokenCodeHash) throw new Error('The EDGE contract does not match the claims service.')
    },
    async refreshBalance() {
      const data = '0x70a08231' + this.ethereumAddress.slice(2).toLowerCase().padStart(64, '0')
      this.balance = ethers.BigNumber.from(await this.walletProvider.request({
        method: 'eth_call', params: [{ to: this.info.tokenAddress, data }, 'latest']
      })).toString()
    },
    async submit() {
      if (this.busy || !this.canContinue || !await this.v$.$validate()) return
      this.busy = true
      this.error = ''
      let requested = false
      try {
        await this.checkWallet()
        await this.refreshBalance()
        if (!this.canContinue) throw new Error('Check your balance and claim details before sending.')
        const request = { ethereumAddress: this.ethereumAddress, xeAddress: this.destination, amount: parseClaimAmount(this.amount).toString() }
        const response = this.active || await ethereumClaimsRequest('/claims', { method: 'POST', body: JSON.stringify(request) })
        validateClaim(response, this.info, request)
        const claim = { ...response, xeAddress: request.xeAddress }
        if (this.active) {
          if (this.active.hash || !this.active.rejected) throw new Error('This burn is unresolved. Check your wallet and keep the claim receipt.')
          const status = await ethereumClaimsRequest(`/claims/${claim.ref}`)
          validateClaim(status, this.info, claim)
          if (status.status !== 'awaiting_transfer') {
            this.active = { ...claim, ...status, xeAddress: claim.xeAddress, hash: status.transfer?.hash || claim.hash }
            this.save()
            this.step = 3
            this.startPolling()
            return
          }
        }
        await this.checkWallet()
        this.active = { ...claim, rejected: false }
        this.save()
        this.step = 3
        requested = true
        const hash = await this.walletProvider.request({ method: 'eth_sendTransaction', params: [{
          from: this.ethereumAddress, to: this.info.tokenAddress, value: '0x0', chainId: this.info.chainId,
          data: encodeClaimTransfer(claim)
        }] })
        this.active = { ...claim, hash }
        this.save()
        this.startPolling()
      }
      catch (err) {
        if (requested && err.code === 4001) {
          this.active.rejected = true
          this.save()
          this.error = 'Transaction rejected. You can confirm the same claim again.'
          this.step = 2
        }
        else {
          this.error = err.message
          if (requested) {
            this.error += ' Check your wallet and the claim status before sending another transfer.'
            this.startPolling()
          }
        }
      }
      finally {
        this.busy = false
      }
    },
    save() {
      localStorage.setItem(ethereumClaimStorageKey(), JSON.stringify(this.active))
    },
    startPolling() {
      this.stopPolling()
      const generation = this.pollGeneration
      const tick = async () => {
        try {
          const claim = await ethereumClaimsRequest(`/claims/${this.active.ref}`)
          if (generation !== this.pollGeneration) return
          validateClaim(claim, this.info, this.active)
          const active = { ...this.active, ...claim, xeAddress: this.active.xeAddress, hash: claim.transfer?.hash || this.active.hash }
          const provider = this.walletProvider || window.ethereum
          if (active.status !== 'received' && active.hash && provider?.request && await provider.request({ method: 'eth_chainId' }) === this.info.chainId) {
            const receipt = await provider.request({ method: 'eth_getTransactionReceipt', params: [active.hash] })
            if (receipt) {
              const tx = await provider.request({ method: 'eth_getTransactionByHash', params: [active.hash] })
              if (tx?.from?.toLowerCase() !== active.ethereumAddress.toLowerCase() || tx?.to?.toLowerCase() !== this.info.tokenAddress.toLowerCase() ||
                  tx.input?.toLowerCase() !== encodeClaimTransfer(active).toLowerCase()) throw new Error('Wallet transaction does not match the claim.')
              const block = await provider.request({ method: 'eth_getBlockByNumber', params: [receipt.blockNumber, false] })
              if (block?.hash === receipt.blockHash) {
                const head = await provider.request({ method: 'eth_blockNumber' })
                active.confirmations = Math.max(0, ethers.BigNumber.from(head).sub(receipt.blockNumber).add(1).toNumber())
                active.status = 'in_block'
                if (receipt.status === '0x0' && active.confirmations >= this.info.confirmations) {
                  const finalized = this.info.chainId === '0x1'
                    ? await provider.request({ method: 'eth_getBlockByNumber', params: ['finalized', false] })
                    : block
                  if (finalized?.number && ethers.BigNumber.from(finalized.number).gte(receipt.blockNumber)) active.status = 'transfer_failed'
                }
              }
            }
          }
          if (generation !== this.pollGeneration) return
          this.active = active
          this.save()
          if (this.received || this.error.startsWith('Could not check claim:')) this.error = ''
        }
        catch (err) {
          if (generation === this.pollGeneration) this.error = `Could not check claim: ${err.message}`
        }
        if (generation === this.pollGeneration && this.visible && !this.received && this.active.status !== 'transfer_failed') {
          this.pollTimer = setTimeout(tick, 1000)
        }
      }
      tick()
    },
    stopPolling() {
      clearTimeout(this.pollTimer)
      this.pollTimer = null
      this.pollGeneration++
    },
    accountsChanged(accounts) {
      if (accounts[0]?.toLowerCase() !== this.ethereumAddress.toLowerCase()) this.walletChanged()
    },
    chainChanged(chainId) {
      if (chainId !== this.info.chainId) this.walletChanged()
    },
    walletChanged() {
      this.ethereumAddress = ''
      this.balance = '0'
      if (!this.active) {
        this.step = 1
        this.error = 'Wallet account or network changed. Connect again.'
      }
    },
    back() {
      if (this.active) {
        localStorage.removeItem(ethereumClaimStorageKey())
        this.active = null
      }
      this.step = 1
    },
    async resume() {
      const active = this.active
      if (!active?.rejected || active.hash || active.status !== 'awaiting_transfer') return
      await this.connect()
      if (this.ethereumAddress.toLowerCase() !== active.ethereumAddress.toLowerCase()) {
        this.error = 'Connect the Ethereum account that created this claim.'
        return
      }
      this.xeAddress = active.xeAddress
      this.amount = ethers.utils.formatUnits(active.amount, 18)
      this.checked = false
      this.v$.$reset()
      this.step = 1
    },
    newClaim() {
      if (!this.burnClaim) return
      if (!this.received && this.active?.status !== 'transfer_failed') return
      if (this.received && !this.receiptSaved) return
      this.stopPolling(); localStorage.removeItem(ethereumClaimStorageKey())
      this.active = null
      this.step = 1
      this.amount = ''
      this.error = this.info?.open ? '' : 'Claims are closed.'
      this.checked = false
      this.receiptSaved = false
      this.receiptNotice = ''
      this.v$.$reset()
      if (this.ethereumAddress) this.refreshBalance().catch(err => {
        this.error = err.message
      })
    },
    cancel() {
      if (this.busy) return
      this.stopPolling()
      this.close()
    },
    async copyReceipt() {
      try {
        await navigator.clipboard.writeText(this.receiptText)
        this.receiptNotice = 'Receipt copied. Save it somewhere you can find later.'
      }
      catch {
        this.receiptNotice = 'Could not copy the receipt. Open Claim receipt and select the text to copy it manually.'
      }
    },
    stageClass(stage) {
      if (this.active.status === 'transfer_failed') return stage === 'posted' ? 'claim-stage--failed' : ''
      const stages = ['posted', 'in_block', 'received']
      const current = stages.indexOf(this.progressStage)
      const index = stages.indexOf(stage)
      if (index < current || this.received) return 'claim-stage--done'
      return index === current ? 'claim-stage--current' : ''
    },
    useAddress(address) {
      this.xeAddress = address
      this.checked = true
      this.creatingAddress = false
    }
  },
  setup() {
    return { v$: useVuelidate() }
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

.claim-link {
  @apply text-green underline;
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

.claim-box--error, .input-error {
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

.claim-stages li.claim-stage--done, .claim-stages li.claim-stage--current {
  @apply text-white;
}

.claim-stages li.claim-stage--done::before {
  content: '●';
  color: #0ecc5f;
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
