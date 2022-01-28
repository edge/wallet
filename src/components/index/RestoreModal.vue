<template>
  <Modal :close="cancel" :visible="visible">
    <template v-slot:header>
      <h2>Restore a wallet</h2>
    </template>

    <template v-slot:body>
      <div class="pt-15">
        <form>
          <div class="form-group" :class="{'form-group__error': v$.privateKey.$error}">
            <label for="key">ENTER private key</label>
            <div class="relative input-wrap">
              <span class="icon">
                <KeyIcon/>
              </span>
              <input type="password" placeholder="Your private key" id="key" v-model="v$.privateKey.$model"/>
            </div>
            <div class="form-group__error input-error" v-for="error of v$.privateKey.$errors" :key="error.$uid">{{error.$message}}</div>
          </div>

          <div class="form-group" :class="{'form-group__error': v$.password.$error || v$.repeatPassword.$error}">
            <label for="password">ENTER PASSWORD</label>
            <div class="relative input-wrap">
              <span class="icon">
                <LockOpenIcon/>
              </span>
              <input
                type="password"
                autocomplete="off"
                placeholder="Choose a password"
                id="password"
                v-model="v$.password.$model"
              />
            </div>
            <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">{{error.$message}}</div>

            <label for="repeat-password" class="mt-10">REPEAT PASSWORD</label>
            <div class="relative input-wrap">
              <span class="icon">
                <LockOpenIcon/>
              </span>
              <input
                type="password"
                @keypress="restoreOnEnter"
                autocomplete="off"
                placeholder="Repeat your password"
                id="repeat-password"
                v-model="v$.repeatPassword.$model"
              />
            </div>
            <div class="form-group__error input-error" v-for="error of v$.repeatPassword.$errors" :key="error.$uid">{{error.$message}}</div>
          </div>

        </form>
      </div>
    </template>

    <template v-slot:footer>
      <div class="grid grid-cols-1 gap-24 px-24 pt-48 border-gray-700 border-solid md:grid-cols-2 border-t-default border-opacity-30 pb-54">
        <button class="w-full button button--outline-success" @click="cancel">Cancel</button>
        <button class="w-full button button--success" :disabled="!canSubmit" @click="restore">Restore</button>
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
  KeyIcon,
  LockOpenIcon
} from '@heroicons/vue/outline'
import { helpers, sameAs } from '@vuelidate/validators'

const privateKeyRegexp = /^[a-fA-F0-9]{64}$/

export default {
  name: 'CreateModal',
  components: {
    KeyIcon,
    LockOpenIcon,
    Modal,
  },
  props: {
    afterRestore: Function,
    close: Function,
    visible: Boolean
  },
  data() {
    return {
      privateKey: '',

      password: '',
      repeatPassword: ''
    }
  },
  validations() {
    return {
      privateKey: [
        validation.required,
        helpers.withMessage('Invalid private key.', v => privateKeyRegexp.test(v))
      ],
      password: [
        validation.passwordRequired,
        validation.passwordLength,
      ],
      repeatPassword: [
        helpers.withMessage('Passwords do not match.', sameAs(this.password))
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
    reset() {
      this.privateKey = ''
      this.password = ''
      this.repeatPassword = ''
      this.v$.$reset()
    },
    async restore() {
      if (!await this.v$.$validate()) return

      const publicKey = xe.wallet.publicKeyFromPrivateKey(this.privateKey)
      const address = xe.wallet.deriveAddress(publicKey)
      await storage.setWallet({ privateKey: this.privateKey, publicKey }, this.password)
      await storage.setWalletVersion(storage.getHighestWalletVersion())
      this.$store.commit('setAddress', address)
      this.$store.commit('unlock')
      this.$store.dispatch('refresh')

      this.afterRestore()
    },
    restoreOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.restore()
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  }
}
</script>
