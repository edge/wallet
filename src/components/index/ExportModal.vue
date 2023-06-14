<template>
  <Modal :close="cancel" :visible="visible">
    <template v-slot:header>
      <h2>Export Private Key</h2>
    </template>

    <template v-slot:body>
      <form v-if="!privateKey">
        <div class="flex items-start leading-8 text-gray mb-14">
        <span class="flex-shrink-0 inline-block mt-8 mr-12 text-white icon w-27">
          <ShieldExclamationIcon/>
        </span>
        <p>Enter your password below to decrypt and display your private key. This will enable you to back up your private key and restore your wallet on other browsers and devices. Do not share your private key with anyone else and be aware of your surroundings while it is visible.</p>
        </div>
        <div class="form-group" :class="{'form-group__error': v$.password.$error || (passwordError && !v$.password.$dirty)}">
          <label for="password">ENTER PASSWORD to export your private key</label>
          <div class="relative input-wrap">
            <span class="icon">
              <LockOpenIcon/>
            </span>
            <input
              type="password"
              @keypress="exportOnEnter"
              autocomplete="off"
              placeholder="Your password"
              id="password"
              v-model="v$.password.$model"
            />
          </div>
          <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">{{error.$message}}</div>
          <div class="form-group__error input-error" v-if="passwordError && !v$.password.$dirty">{{passwordError}}</div>
        </div>
      </form>
      <div v-else class="pt-15">
        <div class="form-group">
          <label>wallet address</label>
          <span class="flex items-center">
            <span class="font-mono break-all text-sm2">{{ address }}</span>
            <button
              class="flex-shrink-0 w-24 ml-24 text-green on-clicked-effect"
              @click.prevent="copyToClipboard(address)"
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
              @click.prevent="copyToClipboard(privateKey)"
            >
              <ClipboardCopyIcon/>
            </button>
          </span>
        </div>
      </div>
    </template>

    <template v-slot:footer>
      <div v-if="!privateKey" class="grid grid-cols-1 gap-24 px-24 pt-24 border-gray-700 border-solid md:grid-cols-2 border-t-default border-opacity-30 pb-24">
        <button class="w-full button button--outline-success" @click="cancel">Cancel</button>
        <button class="w-full button button--success" :disabled="!canSubmit" @click="exportKey">Export</button>
      </div>
      <div v-else class="grid grid-cols-1 gap-24 px-24 pt-20 border-gray-700 border-solid border-t-default border-opacity-30 pb-20">
        <button
          :disabled="!canSubmit"
          @click="cancel"
          class="block w-full mx-auto text-center button button--success md:w-1/2"
        >Done</button>
      </div>
    </template>
  </Modal>
</template>

<script>
import * as storage from '../../utils/storage'
import * as validation from '../../utils/validation'
import Modal from '../Modal.vue'
import { mapState } from 'vuex'
import useVuelidate from '@vuelidate/core'
import { ClipboardCopyIcon, LockOpenIcon, ShieldExclamationIcon } from '@heroicons/vue/outline'

export default {
  name: 'ExportKey',
  components: {
    ClipboardCopyIcon,
    LockOpenIcon,
    Modal,
    ShieldExclamationIcon
  },
  data() {
    return {
      password: '',
      passwordError: '',
      privateKey: ''
    }
  },
  validations() {
    return {
      password: [validation.passwordRequired]
    }
  },
  props: {
    close: Function,
    visible: Boolean
  },
  computed: {
    ...mapState(['address']),
    canSubmit() {
      return !this.v$.$invalid
    }
  },
  methods: {
    cancel() {
      this.reset()
      this.close()
    },
    reset() {
      this.password = ''
      this.privateKey = ''
      this.passwordError = ''
      this.v$.$reset()
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
    async exportKey() {
      this.passwordError = ''

      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return

      this.privateKey = await storage.getPrivateKey(this.password)
    },
    exportOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.exportKey()
    },
    copyToClipboard(input) {
      if (navigator.clipboard) {
        return navigator.clipboard.writeText(input)
      }
      window.alert('Clipboard unavailable. Please copy-paste manually.')
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
