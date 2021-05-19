<template>
  <div class="bg-black bg-center bg-no-repeat bg-cover"
       style="background-image: url('/assets/Map-placeholder.png');">
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
          <div class="text-white md:px-6 mb-11 text-caption">
            <h1 class="text-white mb-2">
              Welcome to the Edge
            </h1>
            <p>Generate or restore an XE wallet to begin</p>
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-24 bg-black-100 py-20 px-24 pb-52 rounded-md">
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
                    <form action="#">
                      <div class="form-group">
                        <label>wallet address</label>
                        <span class="flex items-center">
                          <span class="break-all">
                            xe_d4D5Fdb4d39A4c38d7Ca02b938049edA73b0fA53
                          </span>
                          <a href="#" class="text-green w-20 ml-24 flex-shrink-0">
                            <RefreshIcon/>
                          </a>
                        </span>
                      </div>
                      <div class="form-group" :class="{'form-group__error': v$.passphraseCreate.$error}">
                        <label for="pass-create">ENTER PASSPHRASE</label>
                        <div class="input-wrap relative">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" placeholder='Your passphrase' id="pass-create"
                                 v-model="passphraseCreate">
                        </div>
                        <div class="form-group__error" v-if="v$.passphraseCreate.$error">Name field has an error.</div>
                      </div>
                    </form>
                  </div>
                </template>

                <template v-slot:footer="slotProps">
                  <div
                      class="grid grid-cols-1 md:grid-cols-2 gap-24 border-t-default border-solid border-opacity-30 border-gray-700 pt-48 pb-54 px-24">
                    <a href="#" class="button button--outline-success w-full" @click="slotProps.close">Cancel</a>
                    <a href="#" class="button button--success w-full"
                       @click="showOtherModal(slotProps, 'showCreateModal', [v$.passphraseCreate])">Next</a>
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
                          <span class="break-all">xe_d4D5Fdb4d39A4c38d7Ca02b938049edA73b0fA53</span>
                          <a href="#" class="text-green w-24 ml-24 flex-shrink-0">
                            <ClipboardCopyIcon/>
                          </a>
                        </span>
                    </div>
                    <div class="form-group mb-25">
                      <label>PRIVATE KEY</label>
                      <span class="flex items-center">
                          <span class="break-all">
                            502e8bc4bf77efc021bd7bc3bdc9a974de699ffe6ba52873853ef30e84e509e9
                          </span>
                          <a href="#" class="text-green w-24 ml-18 flex-shrink-0">
                            <ClipboardCopyIcon/>
                          </a>
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
                          will not be able to access your wallet. Please enter your passphrase to confirm you have
                          backed up your details.</p>
                      </div>
                      <div class="form-group" :class="{'form-group__error': v$.passphraseCreate2.$error}">
                        <label for="pass-create2">ENTER PASSPHRASE</label>
                        <div class="input-wrap relative">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" placeholder='Your passphrase' id="pass-create2"
                                 v-model="passphraseCreate2">
                        </div>
                        <div class="form-group__error" v-if="v$.passphraseCreate2.$error">Name field has an error.</div>
                      </div>
                      <div
                          class="grid grid-cols-1 md:grid-cols-2 gap-24">
                        <a href="#" class="button button--outline-success w-full"
                           @click="hideModal(slotProps, 'showCreateModal')">Cancel</a>
                        <a href="#" class="button button--success w-full"
                           @click="completeModal(slotProps, 'showCreateModal', [v$.passphraseCreate2])">Next</a>
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
                    <form action="#">
                      <div class="form-group" :class="{'form-group__error' : v$.privateKey.$error }">
                        <label for="key">ENTER private key</label>
                        <div class="input-wrap relative">
              <span class="icon">
                <KeyIcon/>
              </span>
                          <input type="text" placeholder='Your private key' id="key" v-model="privateKey">
                        </div>
                        <div class="form-group__error" v-if="v$.privateKey.$error">Name field has an error.</div>
                      </div>
                      <div class="form-group" :class="{'form-group__error': v$.passphraseRestore.$error}">
                        <label for="pass">ENTER PASSPHRASE</label>
                        <div class="input-wrap relative">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" placeholder='Your passphrase' id="pass" v-model="passphraseRestore">
                        </div>
                        <div class="form-group__error" v-if="v$.passphraseRestore.$error">Name field has an error.</div>
                      </div>
                    </form>
                  </div>
                </template>

                <template v-slot:footer="slotProps">
                  <div
                      class="grid grid-cols-1 md:grid-cols-2 gap-24 border-t-default border-solid border-opacity-30 border-gray-700 pt-48 pb-54 px-24">
                    <a href="#" class="button button--outline-success w-full"
                       @click="hideModal(slotProps, 'showUnlockModal')">Cancel</a>
                    <a href="#" class="button button--success w-full"
                       @click="showOtherModal(slotProps,'showUnlockModal', [v$.passphraseRestore, v$.privateKey])">Unlock</a>
                  </div>
                </template>
              </Modal>
              <Modal v-if="showUnlockModal === true" :opened="true"
              >
                <template v-slot:header>
                  <h2>Unlock wallet</h2>
                </template>

                <template v-slot:body>
                  <div class="pt-15">
                    <form action="#">
                      <div class="form-group">
                        <label>wallet address</label>
                        <span class="break-all">xe_d4D5Fdb4d39A4c38d7Ca02b938049edA73b0fA53</span>
                      </div>
                      <div class="form-group" :class="{'form-group__error': v$.passphraseUnlock.$error}">
                        <label for="pass-unlock">ENTER PASSPHRASE</label>
                        <div class="input-wrap relative">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" placeholder='Your passphrase' id="pass-unlock"
                                 v-model="passphraseUnlock">
                        </div>
                        <div class="form-group__error" v-if="v$.passphraseUnlock.$error">Name field has an error.</div>
                      </div>
                    </form>
                  </div>
                </template>

                <template v-slot:footer="slotProps">
                  <div
                      class="grid grid-cols-1 md:grid-cols-2 gap-24 border-t-default border-solid border-opacity-30 border-gray-700 pt-48 pb-54 px-24">
                    <a href="#" class="button button--outline-success w-full border-red-600 hover:border-red-600 hover:bg-red-600"
                       @click="hideModal(slotProps, 'showUnlockModal')">Forget wallet</a>
                    <a href="#" class="button button--success w-full"
                       @click="completeModal(slotProps, 'showUnlockModal', [v$.passphraseUnlock])">Unlock</a>
                  </div>
                </template>
              </Modal>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import Logo from "@/components/Logo";
import Modal from '@/components/Modal';
import {KeyIcon, LockOpenIcon, RefreshIcon, ClipboardCopyIcon} from "@heroicons/vue/outline"
import {ShieldExclamationIcon} from '@heroicons/vue/solid'
import {required, minLength} from '@vuelidate/validators'
import useVuelidate from "@vuelidate/core";

export default {
  name: 'Index',
  setup() {
    return {v$: useVuelidate()}
  },
  data: function () {
    return {
      showUnlockModal: false,
      passphraseRestore: '',
      passphraseUnlock: '',
      passphraseCreate: '',
      passphraseCreate2: '',
      privateKey: '',
      showCreateModal: false
    }
  },
  validations() {
    return {
      privateKey: {
        required,
        minLength: minLength(10)
      },
      passphraseRestore: {
        required,
        minLength: minLength(10)
      },
      passphraseUnlock: {
        required,
        minLength: minLength(10)
      },
      passphraseCreate: {
        required,
        minLength: minLength(10)
      },
      passphraseCreate2: {
        required,
        minLength: minLength(10)
      }
    }
  },
  methods: {
    validateFields(fields) {
      if (fields && fields.length) {
        fields.forEach(field => {
          field.$touch()
        })
        const validFields = fields.filter(field => !field.$invalid)
        return validFields.length === fields.length;
      }
    },
    showOtherModal(slotProps, property, fields) {
      return (() => {
        if (fields) {
          if (!this.validateFields(fields)) return
        }
        slotProps.close()
        this[property] = true
      })()
    },
    hideModal(slotProps, property) {
      return (() => {
        slotProps.close()
        this[property] = false
      })()
    },
    completeModal(slotProps, property, fields) {
      return (() => {
        if (fields) {
          if (!this.validateFields(fields)) return
        }
        slotProps.close()
        this[property] = false
      })()
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
