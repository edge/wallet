<template>
    <ForgetWallet :close="closeForgetWalletModal" :afterForget="afterForgetWallet" :visible="showForgetWalletModal"/>
    <ExportKey :close="closeExportKeyModal" :visible="showExportKeyModal"/>
    <header class="relative z-10 py-16 header md:pb-15" :class="{'menu-open':showNav}">
      <div class="container flex items-center justify-between">
        <Logo/>
        <BurgerButton  @click="showNav = !showNav"/>
        <div class="absolute left-0 right-0 flex flex-col flex-1 pt-12 pb-24 bg-black mobile-drop top-full md:static md:flex-row md:pl-15 md:p-0">
          <Menu :mainNav="mainNav"/>
          <HeaderTools :openForgetWalletModal="openForgetWalletModal" :openExportKeyModal="openExportKeyModal"/>
        </div>
      </div>
    </header>
</template>

<script>
  import Logo from "@/components/Logo";
  import Menu from "@/components/Menu";
  import HeaderTools from "@/components/HeaderTools";
  import BurgerButton from "@/components/BurgerButton";
  import ForgetWallet from '@/components/index/ForgetModal';
  import ExportKey from '@/components/index/ExportModal';

  export default {
    name: "Header",
    data: function () {
      return {
        showForgetWalletModal: false,
        showExportKeyModal: false,
        showNav: false,
        mainNav: [
          {
            link: "/overview",
            text: "Overview"
          },
          {
            link: "/transactions",
            text: "Transactions"
          },
          {
            link: "/staking",
            text: "Staking",
            disabled: true
          },
          {
            link: "/governance",
            text: "Governance",
            disabled: true
          },
        ],
      }
    },
    methods: {
      closeForgetWalletModal() {
        this.showForgetWalletModal = false
      },
      openForgetWalletModal() {
        this.showForgetWalletModal = true
      },
      afterForgetWallet() {
        this.$router.push('/')
      },
      closeExportKeyModal() {
        this.showExportKeyModal = false
      },
      openExportKeyModal() {
        this.showExportKeyModal = true
      },
    },
    components: {
      Logo,
      Menu,
      HeaderTools,
      BurgerButton,
      ForgetWallet,
      ExportKey
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