
<template>
  <ul class="flex-1 main-nav">
    <li
      v-for="(item, index) in mainNav"
      :key="index"
      class="main-nav__item"
      :class="item.disabled ? 'disabled' : ''"
    >
      <a v-if="item.external" :href="item.link" target="_blank" class="main-nav__link">
        {{item.text}}
      </a>
      <router-link
        v-else
        :to="item.link"
        class="main-nav__link"
        :class="location && (item.text === 'Transactions' && location.startsWith('/transactions')) ? 'router-link-active' : ''"
      >
        {{item.text}}
      </router-link>
    </li>
  </ul>
</template>

<script>
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Menu',
  props: ['mainNav'],
  data: function () {
    return {
      location: null
    }
  },
  mounted() {
    this.location = window.location.pathname
  }
}
</script>

<style scoped>
  .main-nav__link {
    @apply text-gray block px-12 py-20 transition bg-black-100 bg-opacity-60 hover:text-white;
  }

  .main-nav__link.router-link-active {
    @apply bg-black-100 text-green;
  }

  .main-nav__item.disabled {
    opacity: 0.3;
    pointer-events: none;
  }

  @screen md {
    .main-nav {
      @apply flex flex-wrap -my-20 md:pl-32;
    }
    .main-nav__link {
      @apply py-20 px-24 my-0;
    }
  }
  @screen lg {
    .main-nav__link {
      @apply py-20 pl-32;
    }
  }

  @screen xl {
    .main-nav__item {}
    .main-nav__link {
      @apply py-20 px-32;
    }
  }
</style>
