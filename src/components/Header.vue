<template>
    <div>
      <ForgetWallet
        :close="closeModal"
        :afterForget="afterForgetWallet"
        :visible="modal === 'forget'"
        :wallet="selectedWallet"
        @removed="onWalletRemoved"
      />
      <ExportKey
        :close="closeModal"
        :visible="modal === 'export'"
        :wallet="selectedWallet"
      />
      <CreateWallet
        :close="closeModal"
        :visible="modal === 'create'"
        :afterCreate="closeModal"
        :isAdditionalWallet="isAddingWallet"
        @created="closeModal"
      />
      <RestoreWallet
        :close="closeModal"
        :visible="modal === 'restore'"
        :afterRestore="closeModal"
        :isAdditionalWallet="isAddingWallet"
        @imported="closeModal"
      />
      <header class="relative z-10 py-16 header md:pb-15" :class="{'menu-open':showNav}">
        <div class="container flex items-center justify-between">
          <Logo/>
          <BurgerButton @click="showNav = !showNav"/>
          <div class="absolute left-0 right-0 flex flex-col flex-1 pt-12 pb-24 bg-black mobile-drop top-full md:static md:flex-row md:items-center md:pl-15 md:p-0">
            <Menu :mainNav="mainNav"/>
            <WalletIndicator
              class="md:mr-16"
              @create="openModal('create', true)"
              @import="openModal('restore', true)"
              @export="openExportForWallet"
              @remove="openRemoveForWallet"
            />
            <HeaderTools :openForgetWalletModal="() => openModal('forget')"/>
          </div>
        </div>
      </header>
    </div>
</template>

<script>
import BurgerButton from '@/components/BurgerButton.vue'
import CreateWallet from '@/components/index/CreateModal.vue'
import ExportKey from '@/components/index/ExportModal.vue'
import ForgetWallet from '@/components/index/ForgetModal.vue'
import RestoreWallet from '@/components/index/RestoreModal.vue'
import HeaderTools from '@/components/HeaderTools.vue'
import Logo from '@/components/Logo.vue'
import Menu from '@/components/Menu.vue'
import WalletIndicator from '@/components/wallet/WalletIndicator.vue'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Header',
  data: function () {
    return {
      showNav: false,
      modal: '', // Single modal state: 'forget', 'export', 'create', 'restore'
      selectedWallet: null,
      isAddingWallet: false,

      mainNav: [
        { link: '/overview', text: 'Overview' },
        { link: '/transactions', text: 'Transactions' },
        { link: '/staking', text: 'Staking' },
        { link: '/nodes', text: 'Nodes' },
        { link: import.meta.env.VITE_GOVERNANCE_URL, text: 'Governance', external: true }
      ]
    }
  },
  methods: {
    openModal(name, isAdding = false) {
      this.showNav = false
      this.isAddingWallet = isAdding
      this.modal = name
    },
    closeModal() {
      this.modal = ''
      this.selectedWallet = null
      this.isAddingWallet = false
    },

    // Forget all wallets (from gear menu)
    afterForgetWallet() {
      this.modal = ''
      this.$router.push('/')
    },

    // Remove specific wallet (from dropdown three-dot menu)
    openRemoveForWallet(wallet) {
      this.selectedWallet = wallet
      this.modal = 'forget'
    },
    onWalletRemoved() {
      this.selectedWallet = null
      this.modal = ''
    },

    // Export specific wallet key (from dropdown three-dot menu)
    openExportForWallet(wallet) {
      this.selectedWallet = wallet
      this.modal = 'export'
    }
  },
  components: {
    Logo,
    Menu,
    HeaderTools,
    BurgerButton,
    ForgetWallet,
    ExportKey,
    CreateWallet,
    RestoreWallet,
    WalletIndicator
  }
}
</script>
<style scoped>
  .header {
    @apply bg-black text-white;
  }

  .mobile-drop {
    height: calc((var(--vh) * 100) - 71px);
    transform: translateX(-100%);
    transition: 0.3s transform cubic-bezier(.01,.1,.11,1), 0.3s opacity cubic-bezier(.01,.1,.11,1), 0.3s visibility cubic-bezier(.01,.1,.11,1);
    @apply overflow-hidden overflow-y-auto opacity-0 invisible;
  }

  @screen md {
    .mobile-drop {
      transform: translateX(0);
      @apply h-auto overflow-visible opacity-100 visible;
    }
  }

  .menu-open .mobile-drop {
    transform: translateX(0);
    @apply opacity-100 visible;
  }
</style>
