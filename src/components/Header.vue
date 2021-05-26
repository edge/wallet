<template>
    <header class="header relative z-10 py-16 md:pb-15" :class="{'menu-open':showNav}">
      <div class="container flex items-center justify-between">
        <Logo/>
        <BurgerButton  @click="showNav = !showNav"/>
        <div class="mobile-drop absolute top-full left-0 right-0 md:static flex flex-col md:flex-row bg-black pt-12 md:px-15 pb-24 md:p-0">
          <Menu :mainNav="mainNav"/>
          <HeaderTools/>
        </div>
      </div>
    </header>
</template>

<script>
  import Logo from "@/components/Logo";
  import Menu from "@/components/Menu";
  import HeaderTools from "@/components/HeaderTools";
  import BurgerButton from "@/components/BurgerButton";

  export default {
    name: "Header",
    data: function () {
      return {
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
    },
    components: {
      Logo,
      Menu,
      HeaderTools,
      BurgerButton
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