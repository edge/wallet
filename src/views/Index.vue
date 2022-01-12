<template>
  <div
    class="bg-black bg-center bg-no-repeat bg-cover"
    :style="!hasWallet ? 'background-image: url(/assets/map.svg);' : ''"
  >
    <div class="container">
      <div class="relative">
        <div class="absolute left-0 top-64">
          <Logo/>
        </div>
      </div>
    </div>

    <div class="flex items-center justify-center min-h-screen py-128">
      <div class="container">
        <div class="mx-auto max-w-800">
          <div class="text-white md:px-6 mb-11 text-caption" v-if="!hasWallet">
            <h1 class="mb-2 text-white">
              Welcome to the edge
            </h1>
            <p>Create or restore an XE wallet to begin</p>
          </div>

          <div
            v-if="!hasWallet"
            class="grid grid-cols-1 gap-32 p-32 rounded-md md:grid-cols-2 bg-black-100"
            style="box-shadow: 0px 0px 100px 50px #000000"
          >
            <div>
              <h3 class="mb-18 text-gray">CREATE a new wallet</h3>
              <Modal :closeHandler="swallowClose">
                <template v-slot:opener="slotProps">
                  <button class="w-full button button--success" @click="slotProps.open">
                    Create wallet
                  </button>
                </template>

                <template v-slot:header>
                  <h2>Create a wallet</h2>
                </template>

                <template v-slot:body>
                  <div class="pt-15">
                    <div class="form-group">
                      <label>wallet address</label>
                      <span class="flex items-center">
                        <span class="font-mono break-all text-sm2">{{ xeAddress }}</span>
                        <button
                          class="flex-shrink-0 w-20 ml-24 text-green"
                          v-on:click.prevent="generate()"
                        >
                          <RefreshIcon/>
                        </button>
                        <button
                          class="flex-shrink-0 w-24 ml-24 text-green"
                          v-if="canCopy"
                          @click="copyToClipboard(xeAddress)"
                        >
                          <ClipboardCopyIcon/>
                        </button>
                      </span>
                    </div>
                    <div class="form-group mb-25">
                      <label>PRIVATE KEY</label>
                      <span class="flex items-center">
                        <span class="font-mono break-all text-sm2">
                          {{ privateKey }}
                        </span>
                        <button
                          class="flex-shrink-0 w-24 text-green ml-18"
                          v-if="canCopy"
                          @click="copyToClipboard(privateKey)"
                        >
                          <ClipboardCopyIcon/>
                        </button>
                      </span>
                    </div>
                  </div>
                </template>

                <template v-slot:footer="slotProps">
                  <div class="px-24 pt-48 border-gray-700 border-solid border-t-default border-opacity-30 pb-54">
                    <form>
                      <div class="flex items-start leading-8 text-gray mb-14">
                      <span class="flex-shrink-0 inline-block mt-8 mr-12 text-white icon w-27">
                        <ShieldExclamationIcon/>
                      </span>
                        <p>Ensure you copy and store your wallet address and key securely. If you lose your details you
                          will not be able to access your wallet. Please enter your password to confirm you have
                          backed up your details.</p>
                      </div>
                      <div class="form-group" :class="{'form-group__error': v$.password.$error}">
                        <label for="pass-create">ENTER PASSWORD to encrypt this session</label>
                        <div class="relative input-wrap">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" autocomplete="off" placeholder='Choose a password' id="pass-create" v-model="password">
                        </div>
                        <div class="form-group__error" v-if="v$.password.$error">Must be 10 characters or more.</div>
                      </div>
                      <div class="form-group" :class="{'form-group__error': v$.confirmPhrase.$error}">
                        <label for="confirm-phrase">Please type '<span style="text-transform: none">I confirm I have backed up my private key</span>'</label>
                        <!-- <div class="relative input-wrap"> -->
                          <input type="text" autocomplete="off" id="confirm-phrase" v-model="confirmPhrase">
                        <!-- </div> -->
                        <div class="form-group__error" v-if="v$.confirmPhrase.$error">Confirmation phrase does not match.</div>
                      </div>
                    </form>
                    <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
                      <button class="w-full button button--outline-success" @click="clearForm(); hideModal(slotProps)">Cancel</button>
                      <button class="w-full button button--success" @click.prevent="completeAccountCreate()">Next</button>
                    </div>
                  </div>
                </template>
              </Modal>
            </div>
            <div>
              <h3 class="mb-18 text-gray">restore an existing wallet</h3>
              <Modal :closeHandler="swallowClose">
                <template v-slot:opener="slotProps">
                  <button class="w-full button button--outline-success" @click="slotProps.open">
                    Restore wallet
                  </button>
                </template>
                <template v-slot:header>
                  <h2>Restore a wallet</h2>
                </template>

                <template v-slot:body>
                  <div class="pt-15">
                    <form>
                      <div class="form-group" :class="{'form-group__error' : v$.privateKeyRestore.$error }">
                        <label for="key">ENTER private key</label>
                        <div class="relative input-wrap">
                          <span class="icon">
                            <KeyIcon/>
                          </span>
                          <input type="password" placeholder='Your private key' id="key" v-model="privateKeyRestore">
                        </div>
                        <div class="form-group__error" v-if="v$.privateKeyRestore.$error">Invalid private key.</div>
                      </div>

                      <div class="form-group" :class="{'form-group__error': v$.password.$error}">
                        <label for="pass-create">ENTER PASSWORD</label>
                        <div class="relative input-wrap">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" autocomplete="off" placeholder='Choose a password' id="pass-create" v-model="password">
                        </div>
                        <div class="form-group__error" v-if="v$.password.$error">Must be 10 characters or more.</div>

                        <label for="pass-create" class="mt-10">REPEAT PASSWORD</label>
                        <div class="relative input-wrap">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" @keypress="(event) => handleEnterKeyRestore(event, [v$.password, v$.repeatPassword, v$.privateKeyRestore])" autocomplete="off" placeholder='Repeat your password' id="pass-create-repeat" v-model="repeatPassword">
                        </div>
                        <div class="form-group__error" :class="{ 'form-group--error': v$.repeatPassword.$error }" v-if="v$.repeatPassword.$error">Passwords must match.</div>
                      </div>

                    </form>
                  </div>
                </template>

                <template v-slot:footer="slotProps">
                  <div
                      class="grid grid-cols-1 gap-24 px-24 pt-48 border-gray-700 border-solid md:grid-cols-2 border-t-default border-opacity-30 pb-54">
                    <button
                      class="w-full button button--outline-success"
                      @click="clearForm(); hideModal(slotProps, 'showUnlockModal')"
                    >
                      Cancel
                    </button>
                    <button
                      class="w-full button button--success"
                      @click="restoreWallet([v$.password, v$.repeatPassword, v$.privateKeyRestore])"
                    >
                      Restore
                    </button>
                  </div>
                </template>
              </Modal>
            </div>
          </div>

          <div>
            <Modal v-if="showUnlockModal === true && hasWallet" :opened="true" :closeHandler="swallowClose">
              <template v-slot:header>
                <h2>Unlock wallet</h2>
              </template>

              <template v-slot:body>
                <div class="pt-15">
                  <form>
                    <div class="form-group">
                      <label>wallet address</label>
                      <span class="break-all">{{ wallet.address }}</span>
                    </div>
                    <div class="form-group" :class="{'form-group__error': v$.password.$error}">
                      <label for="pass-unlock">ENTER PASSWORD</label>
                      <div class="relative input-wrap">
                        <span class="icon">
                          <LockOpenIcon/>
                        </span>
                        <input @keypress="(event) => handleEnterKeyUnlock(event, [v$.password])" type="password" autocomplete="off" placeholder='Your password' id="pass-unlock" v-model="password">
                      </div>
                      <div class="form-group__error" v-if="v$.password.$error">Please enter your password.</div>
                      <div class="form-group__error" v-if="invalidPassword">Password incorrect.</div>
                    </div>
                  </form>
                </div>
              </template>

              <template v-slot:footer>
                <div class="grid grid-cols-1 gap-24 px-24 pt-48 border-gray-700 border-solid md:grid-cols-2 border-t-default border-opacity-30 pb-54">
                  <button
                    class="w-full border-red-600 button button--outline-success hover:border-red-600 hover:bg-red-600"
                    @click="openForgetWalletModal"
                  >
                    Forget wallet
                  </button>
                  <button class="w-full button button--success" @click.prevent="unlock([v$.password])">Unlock</button>
                </div>
              </template>
            </Modal>
            <ForgetWallet v-if="showForgetWalletModal" :close="closeForgetWalletModal" :afterForget="afterForgetWallet" :visible="showForgetWalletModal"/>
          </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Logo from "@/components/Logo"
import Modal from '@/components/Modal'
import { KeyIcon, LockOpenIcon, RefreshIcon, ClipboardCopyIcon } from "@heroicons/vue/outline"
import { ShieldExclamationIcon } from '@heroicons/vue/solid'
import { minLength, required, sameAs } from '@vuelidate/validators'
import useVuelidate from "@vuelidate/core"
import { clear } from '../utils/db'
import { fetchWallet } from '../utils/api'
import { getWalletAddress, hasExistingWallet, storePassword, storePrivateKey, storePublicKey, validatePassword } from '../utils/wallet'
import ForgetWallet from '@/components/Modal/ForgetWallet'

const {
  generateKeyPair,
  privateKeyToChecksumAddress,
  privateKeyToPublicKey,
  publicKeyToChecksumAddress
} = require('@edge/wallet-utils')

export default {
  name: 'Index',
  title: 'Create or restore a wallet',
  setup() {
    return {v$: useVuelidate()}
  },
  data: function () {
    return {
      canCopy: false,
      invalidPassword: false,
      showUnlockModal: false,
      showForgetWalletModal: false,
      password: '',
      confirmPhrase: '',
      repeatPassword: '',
      passphraseRestore: '',
      passwordUnlock: '',
      privateKey: '',
      privateKeyRestore: '',
      xeAddress: 'xe_',
      hasWallet: false,
      wallet: {}
    }
  },
  validations() {
    return {
      privateKey: {
        required,
        minLength: minLength(10)
      },
      privateKeyRestore: {
        required,
        validPrivateKey: this.validPrivateKey
      },
      passphraseRestore: {
        required,
        minLength: minLength(10)
      },
      passwordUnlock: {
        required,
        minLength: minLength(10)
      },
      password: {
        required,
        minLength: minLength(10)
      },
      confirmPhrase: {
        required,
        sameAsRawValue: sameAs('I confirm I have backed up my private key')
      },
      repeatPassword: {
        sameAsPassword: sameAs(this.password)
      },
    }
  },
  async mounted () {
    this.canCopy = !!navigator.clipboard
    this.hasWallet = await hasExistingWallet()

    if (!this.hasWallet) {
      // Generates an initial wallet address. User can accept this or regenerate.
      this.generate()
    } else {
      this.loadWallet()
      this.showUnlockModal = true
    }
  },
  methods: {
    clearForm() {
      this.privateKeyRestore = ''
      this.password = ''
      this.repeatPassword = ''
      this.confirmPhrase = ''

      this.v$.privateKeyRestore.$reset()
      this.v$.password.$reset()
      this.v$.confirmPhrase.$reset()
    },
    completeModal(slotProps, property, fields) {
      return (() => {
        if (fields) {
          if (!this.validateFields(fields)) return
        }
        slotProps.close()
        this[property] = false
      })()
    },
    async completeAccountCreate () {
      const ok = this.validateFields([this.v$.password, this.v$.confirmPhrase])

      if (ok) {
        // Store the generated keypair.
        this.save()

        // Redirect to wallet overview screen.
        this.$router.push('overview')
      } else {
        this.invalidPassword = true
      }
    },
    async copyToClipboard (input) {
      await navigator.clipboard.writeText(input)
    },
    isEnter (event) {
      const { key, code, charCode } = event

      return key === 'Enter' || code === 'Enter' || charCode === 13
    },
    handleEnterKeyCreate (event, fields) {
      if (this.isEnter(event)) {
        event.preventDefault()

        this.completeAccountCreate()
      }
    },
    handleEnterKeyRestore (event, fields) {
      if (this.isEnter(event)) {
        event.preventDefault()

        this.restoreWallet(fields)
      }
    },
    handleEnterKeyUnlock (event, fields) {
      if (this.isEnter(event)) {
        event.preventDefault()

        this.unlock(fields)
      }
    },
    async unlock (fields) {
      if (this.validateFields(fields)) {
        const isValidPassword = await validatePassword(this.password)

        if (isValidPassword) {
          // Redirect to wallet overview screen.
          this.$router.push('overview')
        } else {
          this.invalidPassword = true
        }
      }
    },
    async restoreWallet (fields) {
      if (this.validateFields(fields)) {
        const publicKey = privateKeyToPublicKey(this.privateKeyRestore)
        this.xeAddress = privateKeyToChecksumAddress(this.privateKeyRestore)

        storePassword(this.password)

        await storePublicKey(publicKey)
        await storePrivateKey(this.privateKeyRestore)

        this.$router.push('overview')
      }
    },
    async afterForgetWallet() {
      this.hasWallet = false
      this.showForgetWalletModal = false
      this.generate()
    },
    openForgetWalletModal() {
      this.showUnlockModal = false
      this.showForgetWalletModal = true
    },
    closeForgetWalletModal() {
      this.showUnlockModal = true
      this.showForgetWalletModal = false
    },
    generate () {
      this.keyPair = generateKeyPair()
      this.privateKey = this.keyPair.getPrivate('hex').toString()

      this.xeAddress = publicKeyToChecksumAddress(this.keyPair.getPublic(true, 'hex').toString())
    },
    async loadWallet () {
      const walletAddress = await getWalletAddress()
      this.wallet = await fetchWallet(walletAddress)
    },
    async save () {
      const publicKey = this.keyPair.getPublic(true, 'hex').toString()
      const privateKey = this.keyPair.getPrivate('hex').toString()

      await storePublicKey(publicKey)
      await storePrivateKey(privateKey)
    },
    hideModal(slotProps, property) {
      slotProps.close()
      if (property !== undefined) this[property] = false
    },
    // Empty function to ignore the modal close event.
    swallowClose () {},
    validateFields(fields) {
      if (fields && fields.length) {
        fields.forEach(field => {
          field.$touch()
        })
        const validFields = fields.filter(field => !field.$invalid)
        return validFields.length === fields.length;
      }
    },
    validPrivateKey (value) {
      const regex = /^[a-fA-F0-9]{64}$/
      return regex.test(value)
    }
  },
  components: {
    Logo,
    KeyIcon,
    LockOpenIcon,
    Modal,
    RefreshIcon,
    ClipboardCopyIcon,
    ShieldExclamationIcon,
    ForgetWallet
  }
}
</script>
