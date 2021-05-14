<template>
    <header class="header relative z-10 py-16 md:pb-15">
      <div class="container md:flex md:items-center md:justify-between">
        <Logo/>
        <BurgerButton/>

        <div class="mobile-drop absolute top-full left-0 right-0 md:static md:flex bg-black pt-12 px-15 pb-24 md:p-0">
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
        mainNav: [
          {
            link: "#",
            text: "Overview"
          },
          {
            link: "#",
            text: "Transactions"
          },
          {
            link: "#",
            text: "Staking"
          },
          {
            link: "#",
            text: "Governance"
          },
        ],
      }
    },
    components: {
      Logo,
      Menu,
      HeaderTools,
      BurgerButton
    },
  }
</script>
<style scoped>
  .header {
    @apply bg-black text-white;
  }
</style>