<template>
  <Modal :close="close" :visible="visible">
    <template v-slot:header>
      <h2>{{ migrationFailed ? 'Migration Failed' : 'Unlock wallet' }}</h2>
    </template>

    <template v-slot:body>
      <div v-if="migrationFailed" class="pt-15">
        <div class="flex items-start leading-8 text-gray mb-14">
          <p>Wallet migration to the new format failed. Please copy your private key below and reset your wallet to continue.</p>
        </div>
        <div class="form-group">
          <label>wallet address</label>
          <span class="break-all">{{ address }}</span>
        </div>
        <div class="form-group mb-25">
          <label>PRIVATE KEY</label>
          <span class="font-mono break-all text-sm2">{{ legacyPrivateKey }}</span>
        </div>
      </div>

      <div v-else class="pt-15">
        <form>
          <div v-if="walletVersion < 2" class="form-group">
            <label>wallet address</label>
            <span class="break-all">{{ address }}</span>
          </div>
          <div class="form-group" :class="{'form-group__error': v$.password.$error || (passwordError && !v$.password.$dirty)}">
            <label for="password">ENTER PASSWORD</label>
            <div class="relative input-wrap">
              <span class="icon">
                <LockOpenIcon/>
              </span>
              <input
                type="password"
                @keypress="unlockOnEnter"
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
      </div>
    </template>

    <template v-slot:footer>
      <div v-if="migrationFailed" class="px-24 pt-48 border-gray-700 border-solid border-t-default border-opacity-30 pb-54">
        <button
          class="w-full border-red-600 button button--outline-success hover:border-red-600 hover:bg-red-600"
          @click="switchToForgetModal"
        >
          Reset wallet
        </button>
      </div>
      <div v-else class="grid grid-cols-1 gap-24 px-24 pt-48 border-gray-700 border-solid md:grid-cols-2 border-t-default border-opacity-30 pb-54">
        <button
          class="w-full border-red-600 button button--outline-success hover:border-red-600 hover:bg-red-600"
          @click="switchToForgetModal"
        >
          Reset wallet
        </button>
        <button class="w-full button button--success" :disabled="!canSubmit" @click.prevent="unlock">Unlock</button>
      </div>
    </template>
  </Modal>
</template>

<script>
import * as storage from '../../utils/storage'
import * as validation from '../../utils/validation'
import { LockOpenIcon } from '@heroicons/vue/outline'
import Modal from '../Modal.vue'
import { mapState } from 'vuex'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'CreateModal',
  components: {
    LockOpenIcon,
    Modal
  },
  data() {
    return {
      password: '',
      passwordError: '',
      migrationFailed: false,
      legacyPrivateKey: ''
    }
  },
  validations() {
    return {
      password: [validation.passwordRequired]
    }
  },
  props: {
    afterUnlock: Function,
    close: Function,
    switchToForgetModal: Function,
    visible: Boolean
  },
  computed: {
    ...mapState({
      address: 'address',
      walletVersion: 'version'
    }),
    canSubmit() {
      return !this.v$.$invalid
    }
  },
  methods: {
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
    async unlock() {
      this.passwordError = ''

      if (!await this.v$.$validate()) return
      if (!await this.checkPassword()) return

      // Attempt migration from older versions
      try {
        if (await storage.needsMigration()) {
          await storage.migrateToV2(this.password)
        }
      }
      catch (err) {
        // Migration failed — old data preserved (write-verify-delete pattern)
        // Show private key so user can export and reset
        console.error('Migration failed:', err)
        this.legacyPrivateKey = await storage.getLegacyPrivateKey(this.password)
        if (this.legacyPrivateKey) {
          this.migrationFailed = true
        } else {
          this.passwordError = 'Migration failed and wallet data could not be read.'
        }
        return
      }

      try {
        // Use actual stored version (reflects migration success)
        this.$store.commit('setVersion', await storage.getWalletVersion())
        this.$store.commit('unlock')

        // loadWallets derives addresses from vault (v2) or state (legacy)
        await this.$store.dispatch('loadWallets', this.password)

        // Verify wallet loaded before navigating away
        if (!this.$store.state.address) {
          this.$store.commit('lock')
          this.passwordError = 'Failed to load wallet data. Please try again.'
          return
        }

        this.$store.dispatch('refresh')
        this.afterUnlock()
      }
      catch (err) {
        // Roll back unlock state so user stays on unlock screen
        this.$store.commit('lock')
        this.passwordError = err.message || 'An error occurred while unlocking.'
      }
    },
    unlockOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.unlock()
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  }
}
</script>
