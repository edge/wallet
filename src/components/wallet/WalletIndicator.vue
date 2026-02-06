<template>
  <div v-if="!locked" class="wallet-indicator">
    <!-- Mobile: Inline wallet list matching nav style -->
    <div class="wallet-indicator__mobile">
      <div class="wallet-indicator__section-label">Wallets</div>

      <WalletListItem
        v-for="wallet in wallets"
        :key="wallet.id"
        :wallet="wallet"
        :isActive="wallet.id === activeWalletId"
        :balance="walletBalances[wallet.id]"
        :loading="walletBalancesLoading.includes(wallet.id)"
        :canRemove="wallets.length > 1"
        @select="handleSwitch(wallet.id)"
        @rename="handleRename"
        @export="handleExport"
        @remove="handleRemove"
      />

      <div class="wallet-indicator__mobile-actions">
        <button class="wallet-indicator__mobile-action" @click="handleCreate">
          <PlusIcon class="wallet-indicator__mobile-action-icon" />
          Create Wallet
        </button>
        <button class="wallet-indicator__mobile-action" @click="handleImport">
          <DownloadIcon class="wallet-indicator__mobile-action-icon" />
          Import Wallet
        </button>
      </div>
    </div>

    <!-- Desktop: Compact dropdown trigger -->
    <div class="wallet-indicator__desktop">
      <button class="wallet-indicator__trigger" @click="toggleDropdown">
        <span class="wallet-indicator__address">{{ truncatedAddress }}</span>
        <span class="wallet-indicator__chevron">
          <ChevronDownIcon />
        </span>
      </button>

      <WalletDropdown
        v-if="showDropdown"
        v-click-outside="closeDropdown"
        :wallets="wallets"
        :activeWalletId="activeWalletId"
        :balances="walletBalances"
        :loadingBalances="walletBalancesLoading"
        @switch="handleSwitch"
        @create="handleCreate"
        @import="handleImport"
        @rename="handleRename"
        @export="handleExport"
        @remove="handleRemove"
      />
    </div>
  </div>
</template>

<script>
import { ChevronDownIcon, DownloadIcon, PlusIcon } from '@heroicons/vue/outline'
import vClickOutside from 'click-outside-vue3'
import * as storage from '../../utils/storage'
import { mapGetters, mapState } from 'vuex'
import WalletDropdown from './WalletDropdown.vue'
import WalletListItem from './WalletListItem.vue'

export default {
  name: 'WalletIndicator',
  components: {
    ChevronDownIcon,
    DownloadIcon,
    PlusIcon,
    WalletDropdown,
    WalletListItem
  },
  directives: {
    clickOutside: vClickOutside.directive
  },
  emits: ['create', 'import', 'export', 'remove'],
  data() {
    return {
      showDropdown: false
    }
  },
  computed: {
    ...mapState(['wallets', 'activeWalletId', 'address', 'locked', 'walletBalances', 'walletBalancesLoading', 'sessionPassword']),
    ...mapGetters(['canSwitchWallet']),
    truncatedAddress() {
      return this.truncateAddress(this.address)
    }
  },
  mounted() {
    if (this.wallets.length > 0) {
      this.$store.dispatch('fetchAllWalletBalances')
    }
  },
  methods: {
    truncateAddress(addr) {
      if (!addr || addr.length < 11) return addr || ''
      return `${addr.slice(0, 6)}...${addr.slice(-4)}`
    },
    toggleDropdown() {
      this.showDropdown = !this.showDropdown
      if (this.showDropdown) {
        this.$store.dispatch('fetchAllWalletBalances')
      }
    },
    closeDropdown() {
      this.showDropdown = false
    },
    handleSwitch(walletId) {
      this.closeDropdown()
      this.$store.dispatch('switchWallet', walletId)
    },
    handleCreate() {
      this.closeDropdown()
      this.$emit('create')
    },
    handleImport() {
      this.closeDropdown()
      this.$emit('import')
    },
    async handleRename(walletId, newName) {
      if (!this.sessionPassword) return
      try {
        await storage.updateWallet(walletId, newName, this.sessionPassword)
        await this.$store.dispatch('loadWallets', this.sessionPassword)
      } catch (err) {
        console.error('Failed to rename wallet:', err)
      }
    },
    handleExport(wallet) {
      this.closeDropdown()
      this.$emit('export', wallet)
    },
    handleRemove(wallet) {
      this.closeDropdown()
      this.$emit('remove', wallet)
    }
  }
}
</script>

<style scoped>
/* Mobile view - matches main nav styling */
.wallet-indicator__mobile {
  @apply block;
}

.wallet-indicator__desktop {
  @apply hidden;
}

@screen md {
  .wallet-indicator__mobile {
    @apply hidden;
  }
  .wallet-indicator__desktop {
    @apply block relative;
  }
}

/* Section label */
.wallet-indicator__section-label {
  @apply text-gray-500 text-xs uppercase tracking-wider px-12 py-8 mt-16;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

/* Mobile actions */
.wallet-indicator__mobile-actions {
  @apply flex;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.wallet-indicator__mobile-action {
  @apply flex-1 flex items-center justify-center text-gray-400 py-16 transition;
  @apply hover:text-white hover:bg-gray-800 hover:bg-opacity-50 cursor-pointer;
  font-size: 13px;
}

.wallet-indicator__mobile-action-icon {
  @apply w-16 h-16 mr-8;
}

/* Desktop trigger */
.wallet-indicator__trigger {
  @apply flex items-center text-gray transition-colors hover:text-white cursor-pointer;
}

.wallet-indicator__address {
  @apply font-mono text-sm;
}

.wallet-indicator__chevron {
  @apply w-15 ml-4 flex-shrink-0;
}
</style>
