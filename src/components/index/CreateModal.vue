<template>
  <Modal :close="cancel" :visible="visible">
    <template v-slot:header>
      <h2>Create a wallet</h2>
    </template>

    <template v-slot:body>
      <div class="pt-15">
        <div class="form-group">
          <label>wallet address</label>
          <span class="flex items-center">
            <span class="font-mono break-all text-sm2">{{ address }}</span>
            <button
              class="flex-shrink-0 w-20 ml-24 text-green on-clicked-effect"
              v-on:click.prevent="generateWallet"
            >
              <RefreshIcon/>
            </button>
            <button
              class="flex-shrink-0 w-24 ml-24 text-green on-clicked-effect"
              v-if="canCopy"
              @click="copyToClipboard(address)"
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
              class="flex-shrink-0 w-24 text-green ml-18 on-clicked-effect"
              v-if="canCopy"
              @click="copyToClipboard(privateKey)"
            >
              <ClipboardCopyIcon/>
            </button>
          </span>
        </div>
      </div>
    </template>

    <template v-slot:footer>
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
            <label for="password">ENTER PASSWORD to encrypt this session</label>
            <div class="relative input-wrap">
              <span class="icon">
                <LockOpenIcon/>
              </span>
              <input
                type="password"
                @keypress="createOnEnter"
                autocomplete="off"
                placeholder="Choose a password"
                id="password"
                v-model="v$.password.$model"
              />
            </div>
            <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">{{error.$message}}</div>
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
            <div class="form-group__error input-error" v-for="error of v$.confirmPhrase.$errors" :key="error.$uid">{{error.$message}}</div>
          </div>
        </form>
        <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
          <button class="w-full button button--outline-success" @click="cancel">Cancel</button>
          <button class="w-full button button--success" :disabled="!canSubmit" @click.prevent="create">Next</button>
        </div>
      </div>
    </template>
  </Modal>
</template>

<script>
import * as storage from '../../utils/storage'
import * as validation from '../../utils/validation'
import * as xe from '@edge/xe-utils'
import Modal from '../Modal'
import useVuelidate from '@vuelidate/core'
import {
  ClipboardCopyIcon,
  LockOpenIcon,
  RefreshIcon,
  ShieldExclamationIcon
} from '@heroicons/vue/outline'

const confirmPhrase = 'I confirm I have backed up my private key'
const matchConfirmPhrase = validation.caseInsensitive(confirmPhrase, 'Confirmation phrase does not match.')

export default {
  name: 'CreateModal',
  components: {
    ClipboardCopyIcon,
    LockOpenIcon,
    Modal,
    RefreshIcon,
    ShieldExclamationIcon,
  },
  props: {
    afterCreate: Function,
    close: Function,
    visible: Boolean
  },
  data() {
    return {
      address: '',
      privateKey: '',
      publicKey: '',

      password: '',
      confirmPhrase: '',

      canCopy: !!navigator.clipboard,
      phrase: confirmPhrase,
    }
  },
  validations() {
    return {
      password: [
        validation.passwordRequired,
        validation.passwordLength,
      ],
      confirmPhrase: [
        validation.required,
        matchConfirmPhrase
      ]
    }
  },
  computed: {
    canSubmit() {
      return !this.v$.$invalid
    }
  },
  methods: {
    cancel() {
      this.reset()
      this.close()
    },
    async create() {
      if (!await this.v$.$validate()) return

      await storage.setWallet({ privateKey: this.privateKey, publicKey: this.publicKey }, this.password)
      await storage.setWalletVersion(storage.getHighestWalletVersion())
      this.$store.commit('setAddress', this.address)
      this.$store.commit('unlock')
      this.$store.dispatch('refresh')

      this.afterCreate()
    },
    createOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.create()
    },
    copyToClipboard(input) {
      if (!this.canCopy) window.alert('Clipboard unavailable. Please copy-paste manually.')
      return navigator.clipboard.writeText(input)
    },
    generateWallet() {
      const wallet = xe.wallet.create()
      this.address = wallet.address
      this.privateKey = wallet.privateKey
      this.publicKey = wallet.publicKey
    },
    reset() {
      this.password = ''
      this.confirmPhrase = ''
      this.v$.$reset()
    }
  },
  mounted() {
    this.generateWallet()
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  }
}
</script>

<style scoped>
.on-clicked-effect {
  transition: all 0.4s ease-in;
}

.on-clicked-effect:before {
  content: '';
  background-color: aliceblue;
  border-radius: 50%;
  display: block;
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  transform: scale(0.001, 0.001);
}

.on-clicked-effect:focus:not(:active) {
  position: relative;
  display: inline-block;
  outline: 0;
}

.on-clicked-effect:focus:not(:active):before {
  animation: clicked_animation 0.8s ease-out;
}

@keyframes clicked_animation {
  50% {
    transform: scale(1.5, 1.5);
    opacity: 0;
  }
  99% {
    transform: scale(0.001, 0.001);
    opacity: 0;
  }
  100% {
    transform: scale(0.001, 0.001);
    opacity: 1;
  }
}
</style>
