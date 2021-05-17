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
          <div class="grid grid-cols-1 md:grid-cols-2 gap-24 bg-black-100 py-20 px-6 pb-52 rounded-md">
            <div>
              <h3 class="text-gray mb-6">CREATE a new wallet</h3>
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
                          xe_d4D5Fdb4d39A4c38d7Ca02b938049edA73b0fA53
                          <a href="#" class="text-green w-20 ml-24">
                            <RefreshIcon />
                          </a>
                        </span>
                      </div>
                      <div class="form-group" :class="{'form-group__error': v$.passphrase.$error}">
                        <label for="pass-create">ENTER PASSPHRASE</label>
                        <div class="input-wrap relative">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" placeholder='Your passphrase' id="pass-create" v-model="passphrase">
                        </div>
                        <div class="form-group__error" v-if="v$.passphrase.$error">Name field has an error.</div>
                      </div>
                    </form>
                  </div>
                </template>

                <template v-slot:footer="slotProps">
                  <div
                      class="grid grid-cols-1 md:grid-cols-2 gap-24 border-t-default border-solid border-opacity-30 border-gray-700 pt-48 pb-54 px-24">
                    <a href="#" class="button button--outline-success w-full" @click="slotProps.close">Cancel</a>
                    <a href="#" class="button button--success w-full" @click="restoreSubmit(slotProps)">Next</a>
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
                          xe_d4D5Fdb4d39A4c38d7Ca02b938049edA73b0fA53
                          <a href="#" class="text-green w-20 ml-24">
                            <DuplicateIcon />
                          </a>
                        </span>
                      </div>
                      <div class="form-group">
                        <label>PRIVATE KEY</label>
                        <span class="flex items-center">
                          502e8bc4bf77efc021bd7bc3bdc9a974de699ffe6ba52873853ef30e84e509e9
                          <a href="#" class="text-green w-20 ml-24">
                            <DuplicateIcon />
                          </a>
                        </span>
                      </div>
                  </div>
                </template>

                <template v-slot:footer="slotProps">
                  <form action="#">
                  <div class="">
                    <div class="flex items-start text-gray">
                      <span class="icon w-24 mr-12 text-white">
                        <ExclamationIcon />
                      </span>
                      <p>Ensure you copy and store your wallet address and key securely. If you lose your details you will not be able to access your wallet. Please enter your passphrase to confirm you have backed up your details.</p>
                    </div>
                    <div class="form-group" :class="{'form-group__error': v$.passphrase.$error}">
                      <label for="pass-create2">ENTER PASSPHRASE</label>
                      <div class="input-wrap relative">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                        <input type="password" placeholder='Your passphrase' id="pass-create2" v-model="passphrase">
                      </div>
                      <div class="form-group__error" v-if="v$.passphrase.$error">Name field has an error.</div>
                    </div>

                  </div>
                  <div
                      class="grid grid-cols-1 md:grid-cols-2 gap-24 border-t-default border-solid border-opacity-30 border-gray-700 pt-48 pb-54 px-24">
                    <a href="#" class="button button--outline-success w-full" @click="slotProps.close">Cancel</a>
                    <a href="#" class="button button--success w-full" @click="restoreSubmit(slotProps)">Next</a>
                  </div>
                  </form>

                </template>
              </Modal>
            </div>
            <div>
              <h3 class="text-gray mb-6">restore an existing wallet</h3>
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
                      <div class="form-group" :class="{'form-group__error': v$.passphrase.$error}">
                        <label for="pass">ENTER PASSPHRASE</label>
                        <div class="input-wrap relative">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" placeholder='Your passphrase' id="pass" v-model="passphrase">
                        </div>
                        <div class="form-group__error" v-if="v$.passphrase.$error">Name field has an error.</div>
                      </div>
                    </form>
                  </div>
                </template>

                <template v-slot:footer="slotProps">
                  <div
                      class="grid grid-cols-1 md:grid-cols-2 gap-24 border-t-default border-solid border-opacity-30 border-gray-700 pt-48 pb-54 px-24">
                    <a href="#" class="button button--outline-success w-full" @click="slotProps.close">Cancel</a>
                    <a href="#" class="button button--success w-full" @click="restoreSubmit(slotProps)">Unlock</a>
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
                        <span>xe_d4D5Fdb4d39A4c38d7Ca02b938049edA73b0fA53</span>
                      </div>
                      <div class="form-group" :class="{'form-group__error': v$.passphrase.$error}">
                        <label for="pass-unlock">ENTER PASSPHRASE</label>
                        <div class="input-wrap relative">
                          <span class="icon">
                            <LockOpenIcon/>
                          </span>
                          <input type="password" placeholder='Your passphrase' id="pass-unlock" v-model="passphrase">
                        </div>
                        <div class="form-group__error" v-if="v$.passphrase.$error">Name field has an error.</div>
                      </div>
                    </form>
                  </div>
                </template>

                <template v-slot:footer="slotProps">
                  <div
                      class="grid grid-cols-1 md:grid-cols-2 gap-24 border-t-default border-solid border-opacity-30 border-gray-700 pt-48 pb-54 px-24">
                    <a href="#" class="button button--outline-success w-full" @click="hideUnlockModal(slotProps)">Cancel</a>
                    <a href="#" class="button button--success w-full" @click="unlockSubmit(slotProps)">Unlock</a>
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
import {KeyIcon, LockOpenIcon, RefreshIcon, DuplicateIcon, ExclamationIcon} from "@heroicons/vue/outline"
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
      passphrase: '',
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
      passphrase: {
        required,
        minLength: minLength(10)
      }
    }
  },
  methods: {
    restoreSubmit(slotProps) {
      return (() => {
        this.v$.$touch()
        if (this.v$.$error) return
        slotProps.close()
        this.showUnlockModal = true
      })()
    },
    hideUnlockModal(slotProps) {
      return (() => {
        slotProps.close()
        this.showUnlockModal = false
      })()
    },
    unlockSubmit(slotProps) {
      return (() => {
        this.v$.$touch()
        if (this.v$.$error) return
        slotProps.close()
        this.showUnlockModal = false
      })()
    },
    createSubmit(slotProps) {
      return (() => {
        this.v$.$touch()
        if (this.v$.$error) return
        slotProps.close()
        this.showCreateModal = false
      })()
    }
  },
  components: {
    Logo,
    KeyIcon,
    LockOpenIcon,
    Modal,
    RefreshIcon,
    DuplicateIcon,
    ExclamationIcon
  },
  title() {
    return 'XE Wallet » Create or restore a wallet'
  }
}
</script>
