<template>
  <div
    class="wallet-item"
    :class="{ 'wallet-item--active': isActive }"
  >
    <div class="wallet-item__main" @click="$emit('select')">
      <span class="wallet-item__check">
        <CheckCircleIcon v-if="isActive" />
      </span>

      <span class="wallet-item__info">
        <span v-if="!editing && wallet.name" class="wallet-item__name">{{ wallet.name }}</span>
        <span v-if="!editing" class="wallet-item__address">{{ truncatedAddress }}</span>
        <input
          v-if="editing"
          ref="nameInput"
          type="text"
          class="wallet-item__name-input"
          v-model="editName"
          @click.stop
          @keypress.enter="saveRename"
          @keydown.escape="cancelRename"
          @blur="saveRename"
          placeholder="Wallet name"
        />
      </span>

      <span class="wallet-item__balance">
        <svg
          v-if="loading && balance == null"
          class="wallet-item__spinner"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            class="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            stroke-width="4"
          />
          <path
            class="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
          />
        </svg>
        <span v-else>{{ formattedBalance }} XE</span>
      </span>
    </div>

    <button class="wallet-item__menu-trigger" @click="showMenu = !showMenu">
      <DotsVerticalIcon />
    </button>

    <div v-if="showMenu" v-click-outside="closeMenu" class="wallet-item__menu">
      <button class="wallet-item__menu-action" @click.stop="startRename">
        <PencilIcon />
        Rename
      </button>
      <button class="wallet-item__menu-action" @click.stop="handleExport">
        <KeyIcon />
        Export
      </button>
      <button
        v-if="canRemove"
        class="wallet-item__menu-action wallet-item__menu-action--danger"
        @click.stop="handleRemove"
      >
        <TrashIcon />
        Remove
      </button>
    </div>
  </div>
</template>

<script>
import { truncateAddress } from '../../utils/form'
import vClickOutside from 'click-outside-vue3'
import { CheckCircleIcon, DotsVerticalIcon, KeyIcon, PencilIcon, TrashIcon } from '@heroicons/vue/outline'

export default {
  name: 'WalletListItem',
  components: {
    CheckCircleIcon,
    DotsVerticalIcon,
    KeyIcon,
    PencilIcon,
    TrashIcon
  },
  directives: {
    clickOutside: vClickOutside.directive
  },
  props: {
    wallet: {
      type: Object,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    balance: {
      type: Number,
      default: undefined
    },
    loading: {
      type: Boolean,
      default: false
    },
    canRemove: {
      type: Boolean,
      default: true
    }
  },
  emits: ['select', 'rename', 'export', 'remove'],
  data() {
    return {
      showMenu: false,
      editing: false,
      editName: ''
    }
  },
  computed: {
    truncatedAddress() {
      return truncateAddress(this.wallet.address)
    },
    formattedBalance() {
      if (this.balance === undefined || this.balance === null) return '-.--'
      return (this.balance / 1e6).toFixed(2)
    }
  },
  methods: {
    closeMenu() {
      this.showMenu = false
    },
    startRename() {
      this.showMenu = false
      this.editName = this.wallet.name || ''
      this.editing = true
      this.$nextTick(() => {
        if (this.$refs.nameInput) {
          this.$refs.nameInput.focus()
          this.$refs.nameInput.select()
        }
      })
    },
    saveRename() {
      if (!this.editing) return
      const trimmed = this.editName.trim()
      if (trimmed && trimmed !== this.wallet.name) {
        this.$emit('rename', this.wallet.id, trimmed)
      }
      this.editing = false
      this.editName = ''
    },
    cancelRename() {
      this.editing = false
      this.editName = ''
    },
    handleExport() {
      this.showMenu = false
      this.$emit('export', this.wallet)
    },
    handleRemove() {
      this.showMenu = false
      this.$emit('remove', this.wallet)
    }
  }
}
</script>

<style scoped>
.wallet-item {
  @apply relative flex items-center;
}

.wallet-item__main {
  @apply flex items-center w-full px-12 py-10 cursor-pointer transition-colors;
  @apply text-gray hover:text-white hover:bg-gray-700 hover:bg-opacity-25;
  padding-right: 36px;
}

.wallet-item--active .wallet-item__main {
  @apply bg-green bg-opacity-10 text-white;
}

.wallet-item__check {
  @apply w-20 mr-10 flex-shrink-0 text-green flex items-center justify-center;
}

.wallet-item__info {
  @apply flex flex-col items-start flex-grow min-w-0;
  gap: 2px;
}

.wallet-item__name {
  @apply font-medium text-white text-sm leading-tight;
}

.wallet-item__address {
  @apply text-sm2 text-gray-400 leading-tight;
}

.wallet-item--active .wallet-item__address {
  @apply text-gray-300;
}

.wallet-item__name-input {
  @apply bg-gray-700 text-white px-6 py-2 rounded text-sm w-full;
  max-width: 160px;
}

.wallet-item__balance {
  @apply ml-auto text-right text-sm flex-shrink-0 pl-16 text-gray-400;
  min-width: 90px;
}

.wallet-item--active .wallet-item__balance {
  @apply text-gray-300;
}

.wallet-item__spinner {
  @apply w-16 h-16 animate-spin;
}

.wallet-item__menu-trigger {
  @apply absolute right-4 top-1/2 w-24 h-24 flex items-center justify-center;
  @apply text-gray-500 hover:text-white transition-colors cursor-pointer rounded;
  transform: translateY(-50%);
}

.wallet-item__menu-trigger svg {
  @apply w-16 h-16;
}

.wallet-item__menu {
  @apply absolute right-0 bg-black rounded-lg shadow-lg z-30 py-4;
  top: 100%;
  min-width: 140px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.wallet-item__menu-action {
  @apply flex items-center w-full px-12 py-8 text-gray-400 transition-colors cursor-pointer;
  @apply hover:text-white hover:bg-gray-700 hover:bg-opacity-25;
  font-size: 13px;
}

.wallet-item__menu-action svg {
  @apply w-14 h-14 mr-8 flex-shrink-0;
}

.wallet-item__menu-action--danger {
  @apply hover:text-red-400;
}
</style>
