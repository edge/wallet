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
        <p>Ensure you copy and store your wallet address and key securely. If you lose your details you will not be able to access your wallet. Please enter your password to confirm you have backed up your details.</p>
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
              v-if="canCopy"
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
              v-if="canCopy && privateKey"
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
      <div v-else class="px-24 pt-5 pb-30">
        <button class="block w-full mx-auto text-center button button--success md:w-1/2" :disabled="!canSubmit" @click="cancel">Done</button>
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from '../Modal.vue'
import * as storage from '../../utils/storage'
import * as validation from '../../utils/validation'
import useVuelidate from '@vuelidate/core'
import { LockOpenIcon, ShieldExclamationIcon, ClipboardCopyIcon } from '@heroicons/vue/outline'
import { mapState } from 'vuex'

export default {
  name: 'ExportKey',
  components: {
    Modal,
    LockOpenIcon,
    ShieldExclamationIcon,
    ClipboardCopyIcon
  },
  data() {
    return {
      password: '',
      passwordError: '',
      privateKey: '',
      canCopy: !!navigator.clipboard,
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
    ...mapState({
      address: 'address',
    }),
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
      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return
      
      this.privateKey = await storage.getPrivateKey(this.password);
    },
    exportOnEnter(event) {
      event.preventDefault;
      if (event.charCode !== 13) return
      event.preventDefault()
      this.exportKey()
    },
    copyToClipboard(input) {
      if (!this.canCopy) window.alert('Clipboard unavailable. Please copy-paste manually.')
      return navigator.clipboard.writeText(input)
    },
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  }
}
</script>
