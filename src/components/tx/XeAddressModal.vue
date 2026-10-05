<template>
  <div>
    <Modal :close="close" :visible="visible && step === 1">
      <template v-slot:header>
        <h2 class="flex items-center mb-8"><XeLogo/>Create an XE address</h2>
        <span class="sub-heading d-block text-gray text-caption">Step 1 of 2: write down your recovery phrase</span>
      </template>
      <template v-slot:body>
        <div class="pb-14">
          <p class="mb-14 text-gray">
            This is a new address on the XE network. Choose New address until you have one you like.
          </p>
          <div class="form-group mb-14">
            <div class="flex items-center justify-between">
              <label>XE address</label>
              <button class="xe-new" @click="generate"><RefreshIcon/>New address</button>
            </div>
            <span class="font-mono break-all text-sm2">{{ address }}</span>
          </div>
          <p class="mb-14 text-gray">
            Its recovery phrase is these 24 words. Write them down in order and keep them safe.
          </p>
          <ol class="xe-words">
            <li v-for="(word, i) in words" :key="i"><span class="xe-words__n">{{ i + 1 }}</span>{{ word }}</li>
          </ol>
          <div class="flex items-start xe-box">
            <span class="flex-shrink-0 inline-block mr-12 text-white icon w-27"><ShieldExclamationIcon/></span>
            <p class="mb-0">
              Anyone with these words controls your $XE. If you lose them, nobody can recover your $XE.
              This wallet does not keep them.
            </p>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success xe-button-outline" @click="close">Cancel</button>
            <button class="w-full button button--success xe-button" @click="step = 2">I have written them down</button>
          </div>
        </div>
      </template>
    </Modal>

    <Modal :close="close" :visible="visible && step === 2">
      <template v-slot:header>
        <h2 class="flex items-center mb-8"><XeLogo/>Create an XE address</h2>
        <span class="sub-heading d-block text-gray text-caption">Step 2 of 2: check your recovery phrase</span>
      </template>
      <template v-slot:body>
        <div class="pb-14">
          <p class="mb-24 text-gray">Enter these words from your written copy.</p>
          <div
            v-for="(position, i) in positions"
            :key="position"
            class="form-group"
            :class="{'form-group__error': showError(i)}"
          >
            <label :for="`xe-word-${position + 1}`" class="label">Word {{ position + 1 }}</label>
            <input
              :id="`xe-word-${position + 1}`"
              type="text"
              autocomplete="off"
              autocapitalize="off"
              spellcheck="false"
              v-model="answers[i]"
              @blur="touched[i] = true"
            />
            <div v-if="showError(i)" class="form-group__error input-error">
              This is not word {{ position + 1 }}. Check your written copy.
            </div>
          </div>
        </div>
      </template>
      <template v-slot:footer>
        <div class="px-24 pt-32 pb-40 border-t border-gray-700 border-opacity-30">
          <div class="grid grid-cols-1 gap-24 md:grid-cols-2">
            <button class="w-full button button--outline-success xe-button-outline" @click="step = 1">Back</button>
            <button class="w-full button button--success xe-button" :disabled="!canUse" @click="use">Use this address</button>
          </div>
        </div>
      </template>
    </Modal>
  </div>
</template>

<script>
import Modal from '../Modal.vue'
import { h } from 'vue'
import { RefreshIcon, ShieldExclamationIcon } from '@heroicons/vue/outline'
import { newXeAccount, pickCheckPositions } from '../../utils/xe-account'

const CHECK_WORDS = 3

// The XE mark, from xe.network.
const XeLogo = () => h('svg', { viewBox: '0 0 30.001 32', fill: 'currentColor', class: 'xe-logo', 'aria-label': 'XE' }, [
  h('path', { d: 'M14.3896 10.3809C16.3506 12.3011 18.9859 13.3769 21.7305 13.377H30V18.623H21.7305C18.9859 18.6231 16.3506 19.6989 14.3896 21.6191L3.78809 32H0V28.29L8.72266 19.748C10.8236 17.6907 10.8236 14.3093 8.72266 12.252L0 3.70996V0H3.78809L14.3896 10.3809ZM30.001 31.9961H16.3398V30.2471C16.3401 28.3157 17.9064 26.75 19.8379 26.75H30.001V31.9961ZM30.001 0V5.24609H19.8379C17.9064 5.24609 16.34 3.68051 16.3398 1.74902V0H30.001Z' })
])

// Generates a new XE address in the browser and makes the user back up its
// recovery phrase before the claim form can use it. Nothing is stored: the
// words are dropped when the modal closes.
export default {
  name: 'XeAddressModal',
  components: {
    Modal,
    RefreshIcon,
    ShieldExclamationIcon,
    XeLogo
  },
  props: {
    close: Function,
    visible: Boolean
  },
  emits: ['created'],
  data() {
    return {
      step: 1,
      words: [],
      address: '',
      positions: [],
      answers: [],
      touched: []
    }
  },
  computed: {
    matches() {
      return this.positions.map((position, i) => this.answers[i].trim().toLowerCase() === this.words[position])
    },
    canUse() {
      return this.matches.length > 0 && this.matches.every(Boolean)
    }
  },
  watch: {
    visible(v) {
      if (v) this.generate()
      else this.reset()
    }
  },
  methods: {
    generate() {
      const { address, words } = newXeAccount()
      this.words = words
      this.address = address
      this.positions = pickCheckPositions(CHECK_WORDS, words.length)
      this.answers = this.positions.map(() => '')
      this.touched = this.positions.map(() => false)
      this.step = 1
    },
    reset() {
      this.step = 1
      this.words = []
      this.address = ''
      this.positions = []
      this.answers = []
      this.touched = []
    },
    showError(i) {
      return this.touched[i] && this.answers[i] !== '' && !this.matches[i]
    },
    use() {
      if (this.canUse) this.$emit('created', this.address)
    }
  }
}
</script>

<style scoped>
:deep(.xe-logo) {
  color: #ff6900;
  width: 26px;
  height: 28px;
  margin-right: 12px;
  flex-shrink: 0;
}

.xe-words {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px;
}

@media (min-width: 640px) {
  .xe-words {
    grid-template-columns: repeat(4, minmax(0, 1fr));
  }
}

.xe-words li {
  @apply px-10 py-6 font-mono bg-black rounded;
  white-space: nowrap;
}

.xe-words__n {
  display: inline-block;
  min-width: 1.6em;
  margin-right: 6px;
  color: #ff6900;
  text-align: right;
}

.xe-new {
  @apply inline-flex items-center mb-10 text-sm;
  gap: 6px;
  color: #ff6900;
}

.xe-new:hover {
  @apply underline;
}

.xe-new svg {
  width: 18px;
}

.xe-box {
  @apply px-20 py-16 mt-20 bg-black border rounded;
  border-color: #ff6900;
}

.xe-button {
  background-color: #ff6900;
  border-color: #ff6900;
}

.xe-button:hover {
  background-color: #e55e00;
  border-color: #e55e00;
}

.xe-button:disabled {
  background-color: #999999;
  border-color: #999999;
}

.xe-button-outline {
  border-color: #ff6900;
}

.xe-button-outline:hover {
  background-color: #ff6900;
  border-color: #ff6900;
}
</style>
