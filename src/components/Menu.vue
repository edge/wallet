
<template>
  <ul class="main-nav">
    <li
      v-for="(item, index) in mainNav"
      :key="index"
      class="main-nav__item"
    >
      <router-link :to="item.link" class="main-nav__link">
        {{item.text}}
      </router-link>
    </li>
  </ul>
</template>

<script>
export default {
  name: "Menu",
  props: ["mainNav"],
}
</script>

<style scoped>
  .main-nav__link {
    @apply text-gray block p-12 transition bg-black-100 bg-opacity-60 hover:text-white;
  }

  .main-nav__link.router-link-active {
    @apply bg-black-100 text-green;
  }

  @screen md {
    .main-nav {
      @apply flex flex-wrap -my-20;
    }
    .main-nav__link {
      @apply py-20 px-35;
    }
  }
  @screen lg {
    .main-nav__link {
      @apply py-20 px-38;
    }
  }

  @screen xl {
    .main-nav__item {}
    .main-nav__link {
      @apply py-20 px-50;
    }
  }
</style>