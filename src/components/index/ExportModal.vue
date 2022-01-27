<template>
  <Modal :close="close" :visible="visible">
    <template v-slot:header>
      <h2>Export Private Key</h2>
    </template>

    <template v-slot:footer>
      <div class="px-24 pt-48 border-gray-700 border-solid border-t-default border-opacity-30 pb-54">
        <form>
          <div class="flex items-start leading-8 text-gray mb-14">
          <span class="flex-shrink-0 inline-block mt-8 mr-12 text-white icon w-27">
            <ShieldExclamationIcon/>
          </span>
          <p>Ensure you copy and store your wallet address and key securely. If you lose your details you will not be able to access your wallet. Please enter your password to confirm you have backed up your details.</p>
          </div>
          <div class="form-group" :class="{'form-group__error': v$.password.$error}">
            <label for="password">ENTER PASSWORD to export your private key</label>
            <div class="relative input-wrap">
              <span class="icon">
                <LockOpenIcon/>
              </span>
              <input
                type="password"
                @keypress="createOnEnter"
                autocomplete="off"
                placeholder="Your password"
                id="password"
                v-model="v$.password.$model"
              />
            </div>
            <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">{{error.$message}}</div>
          </div>
        </form>
        <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
          <button class="w-full button button--outline-success" @click="cancel">Cancel</button>
          <button class="w-full button button--success" :disabled="!canSubmit" @click.prevent="create">Export</button>
        </div>
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
      this.v$.$reset()
    },
    async checkPassword() {
      this.v$.password.$reset()
      if (await storage.comparePassword(this.password, this.walletVersion)) {
        this.passwordError = ''
        return true
      }
      else {
        this.passwordError = 'Incorrect password.'
        return false
      }
    },
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  }
}
</script>
