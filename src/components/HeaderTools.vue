<template>
  <button @click.prevent="showTools = !showTools" class="header-tools__expand">
    <span class="pointer-events-none header-tools__icon--cog">
      <CogIcon/>
    </span>
    <span class="pointer-events-none header-tools__icon--expand">
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
    <!-- <li class="header-tools__item">
      <router-link to="/" class="header-tools__link">
        <span class="header-tools__icon">
          <KeyIcon/>
        </span>
        Export Private Key
      </router-link>
    </li> -->
    <li class="header-tools__item">
      <div class="header-tools__link" @click="lock">
        <span class="header-tools__icon">
          <LockOpenIcon/>
        </span>
        Lock Wallet
      </div>
    </li>
    <!-- <li class="header-tools__item">
      <router-link to="/" class="header-tools__link header-tools__link--red">
        <span class="header-tools__icon">
          <ArchiveIcon/>
        </span>
        Forget Wallet
      </router-link>
    </li> -->
    <li class="header-tools__item">
      <div class="header-tools__link" @click="forget">
        <span class="header-tools__icon">
          <LogoutIcon/>
        </span>
        Forget Wallet
      </div>
    </li>
  </ul>
</template>

<script>
  import {ArchiveIcon, ChevronDownIcon, CogIcon, KeyIcon, LockOpenIcon, LogoutIcon} from "@heroicons/vue/outline"
  import {SupportIcon} from "@heroicons/vue/solid"
  import vClickOutside from 'click-outside-vue3'
  import ForgetWallet from './index/ForgetModal.vue'

  export default {
    name: "HeaderTools",
    components: {ArchiveIcon, ChevronDownIcon, CogIcon, KeyIcon, ForgetWallet, LockOpenIcon, LogoutIcon, SupportIcon},
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
      },
      forget() {
        this.showTools = false
        this.openForgetWalletModal()
      },
      lock() {
        this.$store.commit('lock')
        this.$router.push('/')
      }
    },
    props: {
      openForgetWalletModal: Function
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

  .header-tools__link--red {
    @apply text-red hover:text-red-500;
  }

  .header-tools__icon {
    @apply block flex-shrink-0 mr-7 w-16;
  }

  .header-tools__icon--expand {
    @apply block flex-shrink-0 w-15;
  }

  .header-tools__icon--cog {
    @apply flex-shrink-0 w-21;
  }

  @screen md {
    .header-tools {
      @apply flex-col space-y-10 absolute top-40 w-56 right-0 bg-black p-0 rounded flex-wrap mt-0;
    }

    .header-tools__item {
      @apply flex flex-wrap mt-0 w-full border-gray-300 md:border-b border-opacity-25 !important;
    }

    .header-tools__item:last-child {
      @apply border-none;
    }

    .header-tools__link {
      @apply p-16 m-0 w-full;
      cursor: pointer;
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