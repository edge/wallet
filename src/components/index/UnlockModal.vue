<template>
  <Modal :close="close" :visible="visible">
    <template v-slot:header>
      <h2>Unlock wallet</h2>
    </template>

    <template v-slot:body>
      <div class="pt-15">
        <form>
          <div class="form-group">
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
      <div class="grid grid-cols-1 gap-24 px-24 pt-48 border-gray-700 border-solid md:grid-cols-2 border-t-default border-opacity-30 pb-54">
        <button
          class="w-full border-red-600 button button--outline-success hover:border-red-600 hover:bg-red-600"
          @click="switchToForgetModal"
        >
          Forget wallet
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
import Modal from '../Modal'
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
      passwordError: ''
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

      const privateKey = await storage.getPrivateKey(this.password, this.walletVersion)
      const publicKey = await storage.getPublicKey(this.walletVersion)

      // do not specify wallet version here - this forces migration to highest version
      await storage.setWallet({ privateKey, publicKey }, this.password)
      await storage.setWalletVersion(storage.getHighestWalletVersion())
      await this.$store.dispatch('reloadWallet')
      this.$store.commit('unlock')
      this.$store.dispatch('refresh')

      this.afterUnlock()
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
