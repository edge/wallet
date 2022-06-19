<template>
  <div>
    <Modal :close="cancel" :visible="visible && step === 1">
      <template v-slot:header>
        <h2 class="mb-8">Deposit EDGE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
        <!-- eslint-disable max-len -->
        <span v-if="browserSupport" class="sub-heading d-block text-gray text-caption">Connect to MetaMask to deposit EDGE for swap.</span>
        <span v-else class="sub-heading d-block text-gray text-caption">Your browser doesn't support the MetaMask browser extension. Please use Brave, Chrome, Edge or Firefox for depositing EDGE.</span>
        <!-- eslint-enable max-len -->
      </template>
      <template v-slot:body>
        <div class="pb-15">
          <!-- eslint-disable-next-line max-len -->
          <div v-if="connectError" class="px-20 py-20 mb-32 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
            <div class="">
              <span class="flex w-full overflow-hidden text-white overflow-ellipsis">
                {{ connectError }}
              </span>
            </div>
          </div>
          <!-- eslint-disable max-len -->
          <button v-if="connectStatus === 'onboarding'" class="w-full mb-16 button button--success" disabled>Waiting for MetaMask...</button>
          <button v-else-if="connectStatus === 'connecting'" class="w-full mb-16 button button--success" disabled>Connecting to MetaMask...</button>
          <button v-else-if="hasMetaMask" class="w-full mb-16 button button--success" @click="connect">Connect MetaMask</button>
          <button v-else class="w-full mb-16 button button--success" @click="installMetaMask" :disabled="!browserSupport">Click to install MetaMask</button>
          <!-- eslint-enable max-len -->
          <button class="w-full button button--outline-success" @click="cancel">Cancel</button>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :preventClickOutside="depositInProgress" :visible="visible && step === 2">
      <template v-slot:header>
        <div class="flex justify-between">
          <div>
            <h2 class="mb-8">Deposit EDGE<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
            <span class="sub-heading d-block text-gray text-caption">
              <Amount :value="edgeBalance" currency="EDGE"/> available
            </span>
          </div>
          <div>
            <div class="px-10 py-5 text-gray-400 border border-green-200 rounded-xl">{{ networkLabel }}</div>
          </div>
        </div>
      </template>
      <template v-slot:body>
        <div>
          <div class="form-group mb-30">
            <span class="label">Depositing from</span>
            <HashLink to="etherscan" :wallet="ethAddress" />
          </div>
          <div class="form-group mb-30">
            <span class="label">Depositing to</span>
            <HashLink to="explorer" :wallet="address" />
          </div>
          <div class="lg-input-group" :class="{'form-group__error': v$.amount.$error}">
            <label for="key">AMOUNT</label>
            <div class="relative input-wrap">
              <input
                type="text"
                id="amount-send"
                placeholder="0.00"
                v-model="v$.amount.$model"
                class="placeholder-white placeholder-opacity-100"
              />
              <span class="absolute right-0 text-xl curren top-23">EDGE</span>
              <!-- eslint-disable-next-line max-len -->
              <div class="mt-5 form-group__error input-error" style="color: #CD5F4E" v-for="error of v$.amount.$errors" :key="error.$uid">{{error.$message}}</div>
            </div>
          </div>
          <div class="flex flex-wrap justify-end pt-12 radio-list">
            <Radio name="currency" id="max" label="MAX" @click=setMaxAmount />
          </div>

          <div class="form-group mb-14">
            <label class="flex items-center space-x-3">
              Transaction fee
              <!-- eslint-disable-next-line max-len -->
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
          <!-- eslint-disable-next-line max-len -->
          <div class="px-10 py-20 mb-32 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
            <div class="md:flex">
              <div class="left md:text-right md:w-1/2 md:flex md:pr-18 md:relative">
                <div class="md:flex-grow">
                  <span class="block mb-3 text-gray">You are depositing</span>
                  <span class="block text-lg text-white price">
                    <Amount :value="amountParsed" currency="EDGE"/>
                  </span>
                </div>
                <!-- eslint-disable-next-line max-len -->
                <span class="flex justify-center p-12 mx-auto mt-12 border border-gray-700 rounded-full md:ml-20 md:mt-0 md:flex-shrink-0 w-52 h-52 border-opacity-30 align-center">
                  <img src="/assets/e-logo-alt.svg" alt="image description" class="flex-shrink-0">
                </span>
                <!-- eslint-disable-next-line max-len -->
                <span class="block mx-auto my-12 icon-arrow md:absolute md:m-0 md:top-1/2 md:-right-13 md:-mt-14 w-27 text-gray">
                  <ArrowRightIcon class="hidden md:block"/>
                  <ArrowDownIcon class="block md:hidden"/>
                </span>
              </div>
              <div class="right md:w-1/2 md:flex md:pl-18">
                <!-- eslint-disable-next-line max-len -->
                <span class="flex justify-center p-8 pl-12 mx-auto mb-12 bg-white border rounded-full md:mb-0 md:flex-shrink-0 md:mr-20 w-52 h-52 align-center">
                  <img src="/assets/logo.svg" alt="XE Wallet" class="flex-shrink-0">
                </span>
                <div class="md:flex-grow">
                  <span class="block mb-3 text-gray">You should receive</span>
                  <span class="block text-lg text-white price">
                    <Amount :value="xeAmount" currency="XE" short/>
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- eslint-disable-next-line max-len -->
          <div v-if="depositMessage" class="px-20 py-20 mb-32 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
            <div class="">
              <span class="deposit-message flex w-full overflow-hidden text-white overflow-ellipsis">
                {{ depositMessage }}
              </span>
            </div>
          </div>
          <!-- eslint-disable-next-line max-len -->
          <div v-if="depositError" class="px-20 py-20 mb-32 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
            <div class="">
              <span class="flex w-full overflow-hidden text-red overflow-ellipsis">
                {{ depositError }}
              </span>
            </div>
          </div>

          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button
              @click="cancel"
              class="w-full button button--outline-success"
            >Cancel</button>
            <button class="w-full button button--success" :disabled="!canDeposit" @click="deposit">Deposit</button>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 3">
      <template v-slot:header>
        <h2 class="mb-8">Deposit accepted<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>
      <template v-slot:body>
        <div>
          <div class="form-group mb-14">
            <label>You are depositing</label>
            <Amount :value="amountParsed" currency="EDGE" sub/>
          </div>

          <div class="form-group mb-14">
            <label>From</label>
            <HashLink to="etherscan" :wallet="completedTx.from" />
          </div>

          <div class="form-group mb-14">
            <label>To</label>
            <HashLink to="explorer" :wallet="address" />
          </div>

          <div class="form-group mb-14">
            <span class="mb-4 label tracking text-base3">Transaction fee</span>
            <div class="relative input-wrap">
              <span class="block w-full overflow-hidden text-white input-filled overflow-ellipsis text-caption">
                <Amount :value="fee" currency="XE" short sub/>
              </span>
            </div>
          </div>

          <div class="form-group mb-14">
            <label>You should receive</label>
            <Amount :value="xeAmount" currency="XE" short sub/>
          </div>

          <div class="form-group mb-14">
            <label>Transaction hash</label>
            <HashLink to="etherscan" :transaction="completedTx.hash" truncated />
          </div>

          <div class="flex items-center mt-24 leading-8 text-gray">
            <p class="mb-0">Your request has been accepted and should be processed within 24 hours.</p>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-40 pb-40 border-t border-gray-700 border-opacity-30">
          <!-- eslint-disable-next-line max-len -->
          <button class="block w-full mx-auto text-center button button--success md:w-3/6" @click="cancel">Close</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
import * as storage from '../../utils/storage'
import * as validation from '../../utils/validation'
import Amount from '../Amount'
import HashLink from '../HashLink'
import { InformationCircleIcon } from '@heroicons/vue/solid'
import MetaMaskOnboarding from '@metamask/onboarding'
import Modal from '../Modal'
import Radio from '../Radio'
import Tooltip from '../Tooltip'
import bridge from '@edge/bridge-utils'
import { detect } from 'detect-browser'
import { ethers } from 'ethers'
import { fetchGasRates } from '../../utils/api'
import { helpers } from '@vuelidate/validators'
import { mapState } from 'vuex'
import { parseAmount } from '../../utils/form'
import useVuelidate from '@vuelidate/core'
import { ArrowDownIcon, ArrowRightIcon } from '@heroicons/vue/outline'

const gasRatesUpdateInterval = 15 * 1000

const etherscanUrls = {
  '0x1': 'https://etherscan.io',
  '0x4': 'https://rinkeby.etherscan.io'
}

const networks = {
  '0x1': {
    key: 'mainnet',
    label: 'Mainnet'
  },
  '0x4': {
    key: 'testnet',
    label: 'Rinkeby Testnet'
  }
}

export default {
  name: 'DepositModal',
  components: {
    Amount,
    ArrowDownIcon,
    ArrowRightIcon,
    HashLink,
    InformationCircleIcon,
    Modal,
    Radio,
    Tooltip
  },
  props: {
    close: Function,
    visible: Boolean
  },
  data() {
    return {
      step: 1,

      connectError: '',
      connectStatus: '',

      edgeBalance: 0,
      ethAddress: '',
      chainId: '',
      network: '',
      networkLabel: '',
      contract: null,

      gasRates: {},
      iGasRates: null,

      amount: '',

      completedTx: null,
      depositInProgress: false,
      depositError: '',
      depositMessage: ''
    }
  },
  validations() {
    return {
      amount: [
        validation.required,
        helpers.withParams(
          { p: this.amountParsed },
          helpers.withMessage('Invalid amount.', () => !isNaN(this.amountParsed) && this.amountParsed > 0)
        ),
        helpers.withParams(
          { b: this.edgeBalance, p: this.amountParsed },
          helpers.withMessage('Insufficient funds.', () => {
            if (isNaN(this.amountParsed)) return false
            console.log(this.amountParsed)
            console.log(this.edgeBalance)
            return this.amountParsed <= this.edgeBalance
          })
        )
      ]
    }
  },
  computed: {
    ...mapState(['address']),
    browserSupport() {
      return ['brave', 'chrome', 'edge', 'firefox'].includes(detect().name)
    },
    hasMetaMask() {
      return window.ethereum !== undefined && window.ethereum.isMetaMask
    },
    amountParsed() {
      return parseAmount(this.amount)
    },
    canDeposit() {
      if (this.depositInProgress || this.v$.$invalid) return false
      return this.xeAmount > 0
    },
    minimumFee() {
      return this.gasRates.minimumHandlingFee || NaN
    },
    fee() {
      if (isNaN(this.minimumFee)) return NaN
      const { handlingFeePercentage } = this.gasRates
      const percentageFee = this.amountParsed * (handlingFeePercentage / 100)
      return Math.round(Math.max(percentageFee, this.minimumFee))
    },
    xeAmount() {
      return Math.max(0, this.amountParsed - this.fee)
    },
    ethTxShortHash() {
      if (this.completedTx === null) return ''
      return [
        this.completedTx.hash.substring(0, 6),
        this.completedTx.hash.substring(this.completedTx.hash.length - 4)
      ].join('...')
    },
    ethTxUrl() {
      if (this.completedTx === null) return ''
      return `${etherscanUrls[this.chainId]}/tx/${this.completedTx.hash}`
    }
  },
  watch: {
    visible(v, oldv) {
      if (v === oldv) return
      if (v) {
        this.updateGasRates()
        this.iGasRates = setInterval(this.updateGasRates, gasRatesUpdateInterval)
        if (this.ethAddress !== '') this.goto(2)
      }
      else {
        clearInterval(this.iGasRates)
        this.iGasRates = null
      }
    }
  },
  methods: {
    cancel() {
      if (this.depositInProgress) {
        this.flashWarning()
      }
      else {
        this.reset()
        this.close()
      }
    },
    checkPassword(input) {
      return storage.comparePassword(input)
    },
    async connect() {
      this.connectStatus = 'connecting'
      try {
        // https://eips.ethereum.org/EIPS/eip-1102#eth_requestaccounts
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })

        // https://eips.ethereum.org/EIPS/eip-695
        this.setChainId(await window.ethereum.request({ method: 'eth_chainId' }))
        window.ethereum.on('chainChanged', this.setChainId)

        this.setAccounts(accounts)
        window.ethereum.on('accountsChanged', this.setAccounts)

        this.goto(2)
      }
      catch (err) {
        console.error(err)
        this.connectError = err.message
        this.connectStatus = ''
        return
      }
    },
    async deposit() {
      if (!await this.v$.$validate()) return

      this.depositInProgress = true
      this.depositError = ''
      this.depositMessage = 'Please confirm the transaction in MetaMask.'

      try {
        const bridgeAddress = bridge.addresses[this.network].bridge
        const amount = ethers.utils.parseEther(this.amountParsed.toString()).toString()
        const tx = await this.contract.approveAndCall(bridgeAddress, amount, this.address)

        this.completedTx = tx
        this.depositInProgress = false
        this.goto(3)
      }
      catch (err) {
        console.error(err)
        this.depositInProgress = false
        if (err.code === 4001) {
          this.depositMessage = 'MetaMask transaction rejected, please try again.'
        }
        else {
          this.depositError = err.toString()
        }
      }
    },
    flashWarning() {
      document.querySelector('.deposit-message').classList.toggle('flash')
      setTimeout(() => {
        document.querySelector('.deposit-message').classList.toggle('flash')
      }, 800)
    },
    goto(step) {
      this.step = step
    },
    installMetaMask() {
      this.connectStatus = 'onboarding'
      const onboarding = new MetaMaskOnboarding()
      onboarding.startOnboarding()
    },
    reset() {
      this.goto(1)

      this.connectError = ''
      this.connectStatus = ''

      this.amount = ''

      this.completedTx = null
      this.depositInProgress = false
      this.depositError = ''
      this.depositMessage = ''

      this.v$.$reset()
    },
    setAccounts(accounts) {
      // https://eips.ethereum.org/EIPS/eip-1193#user-account-exposure-and-account-changes
      const [ethAddress] = accounts
      if (ethAddress === undefined) {
        this.connectError = 'No Ethereum address found.'
        this.connectStatus = ''
        return
      }
      if (ethAddress === this.ethAddress) return

      const provider = new ethers.providers.Web3Provider(window.ethereum)

      this.ethAddress = ethAddress
      this.contract = new ethers.Contract(
        bridge.addresses[this.network].token,
        bridge.token.abi,
        provider.getSigner(0)
      )

      this.updateEdgeBalance()
    },
    async setMaxAmount() {
      this.amount = (Math.floor(this.edgeBalance * 1e6) / 1e6).toString()
      await this.v$.$validate()
    },
    setChainId(chainId) {
      // https://eips.ethereum.org/EIPS/eip-1193#chain-changes
      if (networks[chainId] === undefined) {
        this.connectError = 'Unsupported network. Please use Ethereum Mainnet or Rinkeby Test Network.'
        this.connectStatus = ''
        return
      }
      // TODO ensure correct network selected for mainnet/testnet
      this.chainId = chainId
      this.network = networks[this.chainId].key
      this.networkLabel = networks[this.chainId].label
    },
    async updateEdgeBalance() {
      let balance = await this.contract.balanceOf(this.ethAddress)
      balance = ethers.utils.formatEther(balance.toString())
      this.edgeBalance = parseFloat(balance)
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
.sub-heading  :deep(.amount .currency) {
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

@keyframes flash-red {
  50% {
    color: red;
  }
}

.flash {
  animation: flash-red 800ms 1;
}
</style>
