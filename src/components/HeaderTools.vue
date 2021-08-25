
<template>
  <button @click.prevent="showTools = !showTools" class="header-tools__expand">
    More
    <span class="pointer-events-none header-tools__icon--right">
      <ChevronDownIcon/>
    </span>
  </button>
  <ul v-click-outside="onClickOutside" class="header-tools" :class="showTools ? 'showTools' : 'hideTools'">
    <li class="header-tools__item">
      <a href="https://edge.network/en/contact/" class="header-tools__link" target="_blank" rel="noreferrer">
        <span class="header-tools__icon">
          <SupportIcon/>
        </span>
        Support
      </a>
    </li>
    <li class="header-tools__item">
      <router-link to="/" class="header-tools__link">
        <span class="header-tools__icon">
          <LockOpenIcon/>
        </span>
        Lock
      </router-link>
    </li>
    <li class="header-tools__item">
      <router-link to="/" class="header-tools__link">
        <span class="header-tools__icon">
          <KeyIcon/>
        </span>
        Export Private Key
      </router-link>
    </li>
  </ul>
</template>

<script>
  import {SupportIcon} from "@heroicons/vue/solid"
  import {LockOpenIcon} from "@heroicons/vue/outline"
  import {ChevronDownIcon} from "@heroicons/vue/outline"
  import {KeyIcon} from "@heroicons/vue/outline"
  import vClickOutside from 'click-outside-vue3'
  export default {
    name: "HeaderTools",
    components: {SupportIcon, LockOpenIcon, ChevronDownIcon, KeyIcon},
    data: function () {
      return {
        showTools: false
      }
    },
    directives: {
      clickOutside: vClickOutside.directive
    },
    methods: {
      onClickOutside (event) {
        const target = event.target.className
        if (target !== 'header-tools__expand') {
          this.showTools = false
        }
      }
    }
  }
</script>

<style scoped>
  .header-tools {
    @apply mt-auto px-15 flex-shrink-0;
  }

  .header-tools.showTools {
    @apply block md:flex;
  }

  .header-tools.hideTools {
    @apply block md:hidden;
  }

  .header-tools__expand {
    @apply hidden md:flex items-center text-gray transition-colors hover:text-white;
  }

  .header-tools__link {
    @apply flex items-center text-gray transition-colors hover:text-white p-12;
  }

  .header-tools__icon {
    @apply block flex-shrink-0 mr-7 w-16;
  }

  .header-tools__icon--right {
    @apply block flex-shrink-0 ml-5 w-16;
  }

  @screen md {
    .header-tools {
      @apply flex-col space-y-10 absolute top-32 w-56 right-0 bg-black border border-opacity-50 border-gray-300 p-0 rounded flex-wrap mt-0;
    }

    .header-tools__item {
      @apply flex flex-wrap mt-0 w-full border-gray-300 md:border-b border-opacity-50 !important;
    }

    .header-tools__item:last-child {
      @apply border-none;
    }

    .header-tools__link {
      @apply p-12 m-0 w-full;
    }
  }

  @screen lg {
    .header-tools {
      /* @apply ml-32; */
    }
  }

  @screen xl {
    .header-tools {
      /* @apply ml-48; */
    }
  }
</style>