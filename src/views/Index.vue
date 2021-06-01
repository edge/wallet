<template>
  <div
    class="bg-black bg-center bg-no-repeat bg-cover"
    :style="!hasWallet ? 'background-image: url(/assets/Map-placeholder.png);' : ''"
  >
    <div class="container">
      <div class="relative">
        <div class="absolute top-64 left-0">
          <Logo/>
        </div>
      </div>
    </div>

    <div class="min-h-screen py-128 flex items-center justify-center">
      <div class="container">
        <div class="max-w-800 mx-auto">
          <div class="text-white md:px-6 mb-11 text-caption" v-if="!hasWallet">
            <h1 class="text-white mb-2">
              Welcome to the Edge
            </h1>
            <p>Create or restore an XE wallet to begin</p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-24 bg-black-100 py-20 px-24 pb-52 rounded-md" v-if="!hasWallet">
            <div>
              <h3 class="text-gray mb-24">CREATE a new wallet</h3>
              <Modal
              >
                <template v-slot:opener="slotProps">
                  <a href="#" class="button button--success w-full" @click="slotProps.open">
                    Create wallet
                  </a>
                </template>
                <template v-slot:header>
                  <h2>Create a wallet</h2>
                </template>

                <template v-slot:body>
                  <div class="pt-15">
                    <form>
                      <div class="form-group">
                        <label>wallet address</label>
                        <span class="flex items-center">
                          <span class="break-all font-mono">
                            {{ xeAddress }}
                          </span>
                          <button
                            class="text-green w-20 ml-24 flex-shrink-0"
                            v-on:click.prevent="generate()"
                          >
                            <RefreshIcon/>
                          </button>
                        </span>
                      </div>
                      <div class="form-group" :class="{'form-group__error': v$.password.$error}">
                        <label for="pass-create">ENTER PASSWORD</label>
                        <div class="input-wrap relative">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" placeholder='Choose a password' id="pass-create" v-model="password">
                        </div>
                        <div class="form-group__error" v-if="v$.password.$error">Must be 10 characters or more.</div>
                        
                        <label for="pass-create" class="mt-10">REPEAT PASSWORD</label>
                        <div class="input-wrap relative">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" placeholder='Repeat your password' id="pass-create-repeat" v-model="repeatPassword">
                        </div>
                        <div class="form-group__error" :class="{ 'form-group--error': v$.repeatPassword.$error }" v-if="v$.repeatPassword.$error">Passwords must match.</div>
                      </div>
                    </form>
                  </div>
                </template>

                <template v-slot:footer="slotProps">
                  <div
                      class="grid grid-cols-1 md:grid-cols-2 gap-24 border-t-default border-solid border-opacity-30 border-gray-700 pt-48 pb-54 px-24">
                    <a href="#" class="button button--outline-success w-full" @click="slotProps.close">Cancel</a>
                    <a href="#" class="button button--success w-full"
                       @click="showOtherModal(slotProps, 'showCreateModal', [v$.password, v$.repeatPassword])">Next</a>
                  </div>
                </template>
              </Modal>
              <Modal
                  v-if="showCreateModal === true" :opened="true">
                <template v-slot:header>
                  <h2>Create a wallet</h2>
                </template>

                <template v-slot:body>
                  <div class="pt-15">
                    <div class="form-group">
                      <label>wallet address</label>
                      <span class="flex items-center">
                        <span class="break-all font-mono text-sm2">{{ xeAddress }}</span>
                        <button
                          class="text-green w-24 ml-24 flex-shrink-0"
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
                        <span class="break-all font-mono text-sm2">
                          {{ privateKey }}
                        </span>
                        <button
                          class="text-green w-24 ml-18 flex-shrink-0"
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
                  <div class="border-t-default border-solid border-opacity-30 border-gray-700 pt-48 pb-54 px-24">
                    <form action="#">
                      <div class="flex items-start text-gray leading-8 mb-14">
                      <span class="icon inline-block w-27 mr-12 mt-8 flex-shrink-0 text-white">
                        <ShieldExclamationIcon/>
                      </span>
                        <p>Ensure you copy and store your wallet address and key securely. If you lose your details you
                          will not be able to access your wallet. Please enter your password to confirm you have
                          backed up your details.</p>
                      </div>
                      <div class="form-group" :class="{'form-group__error': v$.passwordConfirm.$error}">
                        <label for="pass-create2">ENTER PASSWORD</label>
                        <div class="input-wrap relative">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" placeholder='Your password' id="pass-create2" v-model="passwordConfirm">
                        </div>
                        <div class="form-group__error" v-if="v$.passwordConfirm.$error">Name field has an error.</div>
                      </div>
                      <div
                          class="grid grid-cols-1 md:grid-cols-2 gap-24">
                        <a href="#" class="button button--outline-success w-full"
                           @click="hideModal(slotProps, 'showCreateModal')">Cancel</a>
                        <a href="#" class="button button--success w-full"
                           @click="completeAccountCreate()">Next</a>
                      </div>
                    </form>
                  </div>
                </template>
              </Modal>
            </div>
            <div>
              <h3 class="text-gray mb-24">restore an existing wallet</h3>
              <Modal
              >
                <template v-slot:opener="slotProps">
                  <a href="#" class="button button--outline-success w-full" @click="slotProps.open">
                    Restore wallet
                  </a>
                </template>
                <template v-slot:header>
                  <h2>Restore a wallet</h2>
                </template>

                <template v-slot:body>
                  <div class="pt-15">
                    <form>
                      <div class="form-group" :class="{'form-group__error' : v$.privateKeyRestore.$error }">
                        <label for="key">ENTER private key</label>
                        <div class="input-wrap relative">
                          <span class="icon">
                            <KeyIcon/>
                          </span>
                          <input type="text" placeholder='Your private key' id="key" v-model="privateKeyRestore">
                        </div>
                        <div class="form-group__error" v-if="v$.privateKeyRestore.$error">Name field has an error.</div>
                      </div>
                      
                      <!-- <div class="form-group" :class="{'form-group__error': v$.passphraseRestore.$error}">
                        <label for="pass">ENTER PASSPHRASE</label>
                        <div class="input-wrap relative">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" placeholder='Your passphrase' id="pass" v-model="passphraseRestore">
                        </div>
                        <div class="form-group__error" v-if="v$.passphraseRestore.$error">Name field has an error.</div>
                      </div> -->
                      <div class="form-group" :class="{'form-group__error': v$.password.$error}">
                        <label for="pass-create">ENTER PASSWORD</label>
                        <div class="input-wrap relative">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" placeholder='Choose a password' id="pass-create" v-model="password">
                        </div>
                        <div class="form-group__error" v-if="v$.password.$error">Must be 10 characters or more.</div>
                        
                        <label for="pass-create" class="mt-10">REPEAT PASSWORD</label>
                        <div class="input-wrap relative">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" placeholder='Repeat your password' id="pass-create-repeat" v-model="repeatPassword">
                        </div>
                        <div class="form-group__error" :class="{ 'form-group--error': v$.repeatPassword.$error }" v-if="v$.repeatPassword.$error">Passwords must match.</div>
                      </div>

                    </form>
                  </div>
                </template>

                <template v-slot:footer="slotProps">
                  <div
                      class="grid grid-cols-1 md:grid-cols-2 gap-24 border-t-default border-solid border-opacity-30 border-gray-700 pt-48 pb-54 px-24">
                    <button
                      class="button button--outline-success w-full"
                      @click="hideModal(slotProps, 'showUnlockModal')"
                    >
                      Cancel
                    </button>
                    <button
                      class="button button--success w-full"
                      @click="restoreWallet([v$.password, v$.repeatPassword])"
                    >
                      Restore
                    </button>
                  </div>
                </template>
              </Modal>
            </div>
          </div>

          <div>
              <Modal v-if="showUnlockModal === true && hasWallet" :opened="true"
              >
                <template v-slot:header>
                  <h2>Unlock wallet</h2>
                </template>

                <template v-slot:body>
                  <div class="pt-15">
                    <form action="#">
                      <div class="form-group">
                        <label>wallet address</label>
                        <span class="break-all">{{ wallet.address }}</span>
                      </div>
                      <div class="form-group" :class="{'form-group__error': v$.password.$error}">
                        <label for="pass-unlock">ENTER PASSWORD</label>
                        <div class="input-wrap relative">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" placeholder='Your password' id="pass-unlock" v-model="password">
                        </div>
                        <div class="form-group__error" v-if="v$.password.$error">Name field has an error.</div>
                      </div>
                    </form>
                  </div>
                </template>

                <template v-slot:footer="slotProps">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-24 border-t-default border-solid border-opacity-30 border-gray-700 pt-48 pb-54 px-24">
                    <button
                      class="button button--outline-success w-full border-red-600 hover:border-red-600 hover:bg-red-600"
                      @click="forgetWallet()"
                    >
                      Forget wallet
                    </button>
                    <button class="button button--success w-full" @click="unlock()">Unlock</button>
                  </div>
                </template>
              </Modal>
            </div>

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Logo from "@/components/Logo"
import Modal from '@/components/Modal'
import {KeyIcon, LockOpenIcon, RefreshIcon, ClipboardCopyIcon} from "@heroicons/vue/outline"
import {ShieldExclamationIcon} from '@heroicons/vue/solid'
import {minLength, required, sameAs} from '@vuelidate/validators'
import useVuelidate from "@vuelidate/core"
import { encrypt } from '../utils/crypto'
import { clear, get, set } from '../utils/db'

const {
  generateKeyPair,
  privateKeyToChecksumAddress,
  privateKeyToPublicKey,
  publicKeyToChecksumAddress
} = require('@edge/wallet-utils')

import { fetchWallet } from '../utils/api'
import { getWalletAddress, hasExistingWallet, storePassword, validatePassword } from '../utils/wallet'

export default {
  name: 'Index',
  setup() {
    return {v$: useVuelidate()}
  },
  data: function () {
    return {
      canCopy: false,
      showCreateModal: false,
      showUnlockModal: false,
      password: '',
      repeatPassword: '',
      passwordConfirm: '',
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
        minLength: minLength(10)
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
      repeatPassword: {
        sameAsPassword: sameAs(this.password)
      },
      passwordConfirm: {
        required,
        minLength: minLength(10)
      }
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
      if (validatePassword(this.passwordConfirm)) {
        // Store the generated keypair.
        this.save()

        // Redirect to wallet overview screen.
        window.location.href = 'overview'
      }
    },
    async copyToClipboard (input) {
      await navigator.clipboard.writeText(input)
    },
    async unlock () {    
      if (validatePassword(this.password)) {
        // Redirect to wallet overview screen.
        window.location.href = 'overview'
      }
    },
    async restoreWallet (fields) {
      if (this.validateFields(fields)) {
        const publicKey = privateKeyToPublicKey(this.privateKeyRestore)
        this.xeAddress = privateKeyToChecksumAddress(this.privateKeyRestore)

        storePassword(this.password)

        await set('p1', encrypt(publicKey))
        await set('p2', encrypt(this.privateKeyRestore))
      
        window.location.href = '/overview'
      }
    },
    async forgetWallet () {
      await clear()
      window.location.href = '/'
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
      
      await set('p1', encrypt(publicKey))
      await set('p2', encrypt(privateKey))
    },
    hideModal(slotProps, property) {
      return (() => {
        slotProps.close()
        this[property] = false
      })()
    },
    showOtherModal(slotProps, property, fields) {
      return (() => {
        if (fields) {
          if (!this.validateFields(fields)) return
        }
        slotProps.close()
        this[property] = true

        if (property === 'showCreateModal') {
          console.log('SAVE PASSWORD HERE')
          storePassword(this.password)
        }
      })()
    },
    validateFields(fields) {
      if (fields && fields.length) {
        fields.forEach(field => {
          field.$touch()
        })
        const validFields = fields.filter(field => !field.$invalid)
        return validFields.length === fields.length;
      }
    }
  },
  components: {
    Logo,
    KeyIcon,
    LockOpenIcon,
    Modal,
    RefreshIcon,
    ClipboardCopyIcon,
    ShieldExclamationIcon
  },
  title() {
    return 'XE Wallet » Create or restore a wallet'
  }
}
</script>
