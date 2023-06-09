<template>
  <div>
    <Modal :close="cancel" :visible="visible && step === 1">
      <template v-slot:header>
        <h2 class="mb-8">Assign Device<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>

      <template v-slot:body>
        <div>
          <div class="form-group mb-14">
            <label>Stake ID</label>
            <HashLink to="explorer" :stake="stake.id" truncated />
          </div>
          <div class="form-group mb-25">
            <label class="label">Stake Type</label>
            <span class="break-all text-3xl">{{ stakeTypeFormatted }}</span>
          </div>
          <div v-if="entryMode === 'token'">
            <div class="form-group mb-14" :class="{'form-group__error': v$.token.$error}">
              <label for="token" class="label">Device Token</label>
              <input type="text" placeholder="Enter your device token" id="token" v-model="v$.token.$model"/>
              <div class="form-group__error input-error" v-for="error of v$.token.$errors" :key="error.$uid">{{error.$message}}</div>
              <div v-if="tokenError" class="form-group__error input-error">{{ tokenError }}</div>
            </div>
            <a href="#" class="inline-block mb-14 hover:text-green text-sm2 float-right" @click="toggleEntryMode">Enter device information manually</a>
          </div>
          <div v-else>
            <div class="form-group mb-14" :class="{'form-group__error': v$.device.$error}">
              <label for="device" class="label">Device Address</label>
              <input type="text" placeholder="Enter a device address" id="device" v-model="v$.device.$model"/>
              <div class="form-group__error input-error" v-for="error of v$.device.$errors" :key="error.$uid">{{error.$message}}</div>
            </div>
            <div class="form-group mb-14" :class="{'form-group__error': v$.deviceKey.$error}">
              <label for="device-key" class="label">Device Private Key</label>
              <input type="text" placeholder="Enter the corresponding private key" id="device-key" v-model="v$.deviceKey.$model"/>
              <div class="form-group__error input-error" v-for="error of v$.deviceKey.$errors" :key="error.$uid">{{error.$message}}</div>
            </div>
            <a href="#" class="inline-block mb-14 hover:text-green text-sm2 float-right" @click="toggleEntryMode">Enter a device token</a>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="cancel">Cancel</button>
            <button
              :disabled="!canReadyAssign"
              @click="readyAssign"
              class="w-full button button--success"
            >
              Assign
            </button>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 2">
      <template v-slot:header>
        <h2 class="mb-8">Assign Device<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>

      <template v-slot:body>
        <div class="pb-14">
          <div class="form-group mb-14">
            <label>Stake ID</label>
            <HashLink to="explorer" :stake="stake.id" truncated />
          </div>
          <div class="form-group mb-25">
            <label class="label">Stake Type</label>
            <span class="break-all text-3xl">{{ stakeTypeFormatted }}</span>
          </div>
          <div class="form-group mb-25">
            <label class="label">Device Address</label>
            <a :href="explorerNodeUrl" target="_blank">
              <span class="monospace lg:inline-block text-white">
                {{ device }}
              </span>
            </a>
          </div>
          <div class="form-group mb-14" v-if="stake.device">
            Device <span class="monospace lg:inline-block">{{ stake.device }}</span> is already assigned to this stake and will be replaced.
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <form>
            <div class="form-group" :class="{'form-group__error': v$.password.$error || (passwordError && !v$.password.$dirty)}">
              <label for="pass-step">Enter Password</label>
              <div class="relative input-wrap">
                <span class="icon">
                  <LockOpenIcon/>
                </span>
                <input
                  type="password"
                  autocomplete="off"
                  @keypress="assignOnEnter"
                  placeholder="Your password"
                  id="pass-step"
                  v-model="v$.password.$model"
                />
              </div>
              <div class="form-group__error input-error" v-for="error of v$.password.$errors" :key="error.$uid">{{error.$message}}</div>
              <div class="form-group__error input-error" v-if="passwordError && !v$.password.$dirty">{{passwordError}}</div>
            </div>
          </form>
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success" @click="goto(1)">Back</button>
            <button
              :disabled="!canAssign"
              @click="assign"
              class="w-full button button--success"
            >Assign Stake</button>
          </div>
          <div v-if="submitError" class="px-20 py-20 my-20 text-center bg-black border border-gray-700 rounded convert-info md:text-left border-opacity-30 border-color">
            <div class="">
              <span class="flex w-full overflow-hidden text-white overflow-ellipsis">
                {{ submitError }}
              </span>
            </div>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="cancel" :visible="visible && step === 3">
      <template v-slot:header>
        <h2 class="mb-8">Assignment sent<span class="testnet-header" v-if="isTestnet">(Testnet)</span></h2>
      </template>

      <template v-slot:body>
        <div class="pb-14">
          <div class="form-group mb-25">
            <label class="label">Stake Type</label>
            <span class="break-all text-3xl">{{ stakeTypeFormatted }}</span>
          </div>
          <div class="form-group mb-14">
            <label>Transaction hash</label>
            <HashLink to="explorer" :transaction="completedTx.hash" truncated />
          </div>
          <div class="form-group mb-14">
            <label>Device Address</label>
            <a :href="explorerNodeUrl" target="_blank">
              <span class="monospace lg:inline-block text-white">
                {{ device }}
              </span>
            </a>
          </div>
          <div class="flex items-center mt-24 leading-8 text-gray">
            <p class="mb-0">Your transaction has been submitted. Once processed, your device will be assigned to this stake. This may take a minute or two.</p>
          </div>
        </div>
      </template>

      <template v-slot:footer>
        <div class="px-24 pt-40 pb-40 border-t border-gray-700 border-opacity-30">
          <button
            @click="cancel"
            class="block w-full mx-auto text-center button button--success md:w-1/2"
          >Close</button>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
/*global process*/
import * as storage from '../../utils/storage'
import * as validation from '../../utils/validation'
import * as xe from '@edge/xe-utils'
import Base64 from 'crypto-js/enc-base64'
import HashLink from '../HashLink.vue'
import { LockOpenIcon } from '@heroicons/vue/outline'
import Modal from '../Modal.vue'
import UTF8 from 'crypto-js/enc-utf8'
import { helpers } from '@vuelidate/validators'
import { mapState } from 'vuex'
import useVuelidate from '@vuelidate/core'

export default {
  name: 'AssignDeviceModal',
  components: {
    HashLink,
    LockOpenIcon,
    Modal
  },
  props: {
    close: Function,
    stake: Object,
    visible: Boolean
  },
  data() {
    return {
      step: 1,
      entryMode: 'token',

      token: '',
      tokenError: '',

      device: '',
      deviceKey: '',

      password: '',
      passwordError: '',

      completedTx: null,
      submitError: ''
    }
  },
  validations() {
    return {
      token: [
        validation.required
      ],
      device: [
        validation.required,
        validation.xeAddress,
        helpers.withMessage('This device is already assigned to this stake.', addr => addr !== this.stake.device)
      ],
      deviceKey: [
        validation.required
      ],
      password: [validation.passwordRequired]
    }
  },
  computed: {
    ...mapState(['address', 'nextNonce']),
    canAssign() {
      return !this.v$.$invalid
    },
    canReadyAssign() {
      if (!this.v$.$anyDirty) return false
      if (this.entryMode === 'token') return !this.v$.token.$error
      return !this.v$.device.$error && !this.v$.deviceKey.$error
    },
    stakeTypeFormatted() {
      return this.stake.type[0].toUpperCase() + this.stake.type.slice(1)
    },
    explorerNodeUrl() {
      return `${process.env.VUE_APP_EXPLORER_URL}/node/${this.device}`
    }
  },
  methods: {
    cancel() {
      this.reset()
      this.close()
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
    goto(step) {
      this.step = step
    },
    async readyAssign() {
      if (this.entryMode === 'token') {
        this.v$.token.$touch()
        if (this.v$.token.$error) return
        try {
          const words = Base64.parse(this.token)
          const str = UTF8.stringify(words)
          const data = JSON.parse(str)
          console.log(data)
          if (!data || !data.address || !data.privateKey) throw new Error('Invalid device token.')
          if (!validation.xeAddressRegexp.test(data.address)) throw new Error('Invalid address.')
          this.device = data.address
          this.deviceKey = data.privateKey
        }
        catch (err) {
          if (err.message.startsWith('JSON.parse')) this.tokenError = 'Invalid device token.'
          else this.tokenError = err.message
          return
        }
      }
      else {
        this.v$.device.$touch()
        this.v$.deviceKey.$touch()
        if (this.v$.device.$error || this.v$.deviceKey.$error) return
      }
      this.tokenError = ''
      this.goto(2)
    },
    reset() {
      this.goto(1)
      this.entryMode = 'token'

      this.token = ''

      this.device = ''
      this.deviceKey = ''

      this.password = ''
      this.passwordError = ''

      this.v$.$reset()
    },
    toggleEntryMode() {
      this.entryMode = this.entryMode === 'token' ? 'manual' : 'token'
    },
    async assign() {
      this.passwordError = ''
      if (!this.canAssign) return
      if (!await this.checkPassword()) return
      const privateKey = await storage.getPrivateKey(this.password)

      const tx = xe.tx.sign({
        timestamp: Date.now(),
        sender: this.address,
        recipient: this.address,
        amount: 0,
        data: {
          action: 'assign_device',
          device: this.device,
          memo: 'Assign Device',
          signature: xe.wallet.generateSignature(this.deviceKey, this.device),
          stake: this.stake.hash
        },
        nonce: this.nextNonce
      }, privateKey)

      // submit tx to blockchain
      try {
        const { metadata, results } = await xe.tx.createTransactions(process.env.VUE_APP_BLOCKCHAIN_API_URL, [tx])
        if (metadata.accepted) {
          this.completedTx = results[0]
          this.goto(3)
        }
        else {
          this.submitError = results[0].reason
        }
      }
      catch (err) {
        console.error(err)
        this.submitError = err.message
      }
    },
    assignOnEnter(event) {
      if (event.charCode !== 13) return
      event.preventDefault()
      this.assign()
    }
  },
  setup() {
    return {
      v$: useVuelidate()
    }
  },
  watch: {
    token() {
      this.tokenError = ''
    },
    visible(v, oldv) {
      if (v === oldv) return
      if (v) {
        this.$store.dispatch('refresh')
      }
    }
  }
}
</script>

<style scoped>
.sub-heading :deep(.amount .currency) {
  @apply ml-5;
}

.testnet-header {
  color: #0ecc5f;
  padding-left: 10px;
}
</style>
