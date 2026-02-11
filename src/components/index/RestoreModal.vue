<template>
  <Modal :close="cancel" :visible="visible">
    <template v-slot:header>
      <h2>{{ isAdditionalWallet ? 'Import wallet' : 'Restore a wallet' }}</h2>
    </template>

    <template v-slot:body>
      <div class="pt-15">
        <form>
          <div v-if="isAdditionalWallet" class="flex items-start leading-8 text-gray mb-14">
            <span class="flex-shrink-0 inline-block mt-8 mr-12 text-white icon w-27">
              <ShieldExclamationIcon/>
            </span>
            <p>Enter a private key below to import a wallet. The wallet will be encrypted with your existing password.</p>
          </div>
          <div class="form-group" :class="{'form-group__error': v$.privateKey.$error || importError}">
            <label for="key">ENTER private key</label>
            <div class="relative input-wrap">
              <span class="icon">
                <KeyIcon/>
              </span>
              <input type="password" placeholder="Your private key" id="key" v-model="v$.privateKey.$model"/>
            </div>
            <div class="form-group__error input-error" v-for="error of v$.privateKey.$errors" :key="error.$uid">{{error.$message}}</div>
            <div class="form-group__error input-error" v-if="importError">{{importError}}</div>
          </div>

          <div v-if="!isAdditionalWallet" class="form-group" :class="{'form-group__error': v$.password.$error || v$.repeatPassword.$error}">
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
        <button class="w-full button button--success" :disabled="!canSubmit" @click="restore">{{ isAdditionalWallet ? 'Import' : 'Restore' }}</button>
      </div>
    </template>
  </Modal>
</template>

<script>
import * as storage from '../../utils/storage'
import * as validation from '../../utils/validation'
import * as xe from '@edge/xe-utils'
import Modal from '../Modal.vue'
import useVuelidate from '@vuelidate/core'
import { mapState } from 'vuex'
import {
  KeyIcon,
  LockOpenIcon,
  ShieldExclamationIcon
} from '@heroicons/vue/outline'
import { helpers, sameAs } from '@vuelidate/validators'

const privateKeyRegexp = /^[a-fA-F0-9]{64}$/

export default {
  name: 'RestoreModal',
  components: {
    KeyIcon,
    LockOpenIcon,
    Modal,
    ShieldExclamationIcon
  },
  props: {
    afterRestore: Function,
    close: Function,
    visible: Boolean,
    isAdditionalWallet: Boolean // When true, imports to existing vault instead of creating new
  },
  emits: ['imported'],
  data() {
    return {
      privateKey: '',
      password: '',
      repeatPassword: '',
      importError: ''
    }
  },
  validations() {
    const rules = {
      privateKey: [
        validation.required,
        helpers.withMessage('Invalid private key.', v => privateKeyRegexp.test(v))
      ]
    }
    // Skip password validation when adding to existing vault
    if (!this.isAdditionalWallet) {
      rules.password = [
        validation.passwordRequired,
        validation.passwordLength
      ]
      rules.repeatPassword = [
        helpers.withMessage('Passwords do not match.', sameAs(this.password))
      ]
    }
    return rules
  },
  computed: {
    ...mapState(['sessionPassword', 'wallets']),
    canSubmit() {
      return !this.v$.$invalid
    }
  },
  watch: {
    visible(newVal) {
      if (!newVal) {
        this.reset()
      }
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
      this.importError = ''
      this.v$.$reset()
    },
    async restore() {
      if (!await this.v$.$validate()) return
      this.importError = ''

      const publicKey = xe.wallet.publicKeyFromPrivateKey(this.privateKey)
      const address = xe.wallet.deriveAddress(publicKey)

      if (this.isAdditionalWallet) {
        // Check for duplicate
        const exists = this.wallets.some(w => w.address === address)
        if (exists) {
          this.importError = 'This wallet has already been added.'
          return
        }

        // Import to existing vault
        await storage.addWallet({
          publicKey,
          privateKey: this.privateKey,
          name: 'Wallet ' + (this.wallets.length + 1)
        }, this.sessionPassword)

        await this.$store.dispatch('loadWallets', this.sessionPassword)
        this.$store.dispatch('refresh')
        this.$emit('imported')
        this.reset()
        this.close()
      } else {
        // Initial wallet restore
        await storage.setWallet({ privateKey: this.privateKey, publicKey }, this.password)

        this.$store.commit('setAddress', address)
        this.$store.commit('setVersion', storage.getHighestWalletVersion())
        this.$store.commit('unlock')

        await this.$store.dispatch('loadWallets', this.password)
        this.$store.dispatch('refresh')

        this.afterRestore()
      }
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
