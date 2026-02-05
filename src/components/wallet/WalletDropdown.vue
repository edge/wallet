<template>
  <div class="wallet-dropdown">
    <div class="wallet-dropdown__list">
      <WalletListItem
        v-for="wallet in wallets"
        :key="wallet.id"
        :wallet="wallet"
        :isActive="wallet.id === activeWalletId"
        :balance="balances[wallet.id]"
        :loading="loadingBalances.includes(wallet.id)"
        :canRemove="wallets.length > 1"
        @select="$emit('switch', wallet.id)"
        @rename="(id, name) => $emit('rename', id, name)"
        @export="(wallet) => $emit('export', wallet)"
        @remove="(wallet) => $emit('remove', wallet)"
      />
    </div>

    <div class="wallet-dropdown__divider" />

    <div class="wallet-dropdown__actions">
      <button class="wallet-dropdown__action" @click="$emit('create')">
        <span class="wallet-dropdown__action-icon">
          <PlusIcon />
        </span>
        Create Wallet
      </button>
      <button class="wallet-dropdown__action" @click="$emit('import')">
        <span class="wallet-dropdown__action-icon">
          <DownloadIcon />
        </span>
        Import Wallet
      </button>
    </div>
  </div>
</template>

<script>
import { DownloadIcon, PlusIcon } from '@heroicons/vue/outline'
import WalletListItem from './WalletListItem.vue'

export default {
  name: 'WalletDropdown',
  components: {
    DownloadIcon,
    PlusIcon,
    WalletListItem
  },
  props: {
    wallets: {
      type: Array,
      required: true
    },
    activeWalletId: {
      type: String,
      default: null
    },
    balances: {
      type: Object,
      default: () => ({})
    },
    loadingBalances: {
      type: Array,
      default: () => []
    }
  },
  emits: ['switch', 'create', 'import', 'rename', 'export', 'remove']
}
</script>

<style scoped>
.wallet-dropdown {
  @apply absolute bg-black rounded-lg shadow-lg z-20;
  min-width: 280px;
  width: max-content;
  max-width: 380px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  /* Mobile: open above trigger, align left */
  bottom: 100%;
  left: 0;
  margin-bottom: 6px;
}

@screen md {
  .wallet-dropdown {
    /* Desktop: open below trigger, align right */
    bottom: auto;
    top: 100%;
    left: auto;
    right: 0;
    margin-bottom: 0;
    margin-top: 6px;
  }
}

.wallet-dropdown__list {
  @apply py-6;
}

.wallet-dropdown__divider {
  @apply border-t border-gray-300 border-opacity-20 mx-12;
}

.wallet-dropdown__actions {
  @apply py-6;
}

.wallet-dropdown__action {
  @apply flex items-center w-full px-12 py-10 text-gray-400 transition-colors;
  @apply hover:text-white hover:bg-gray-700 hover:bg-opacity-25 cursor-pointer;
  font-size: 13px;
}

.wallet-dropdown__action-icon {
  @apply w-16 mr-10 flex-shrink-0 flex items-center justify-center;
}
</style>
