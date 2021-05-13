<template>
  <div class="items-center">
    <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
      XE Wallet
    </h2>
    <Logo/>
    <p class="flex items-center text-sm text-gray-500 text-center pt-2">
      <LockOpenIcon class="flex-shrink-0 mr-1.5 h-5 w-5 text-green-400" aria-hidden="true" />
      Heroicon example
    </p>

    <router-link to="link-here">Router link example</router-link>
  </div>
</template>

<script>
// import { LockOpenIcon } from '@heroicons/vue/solid'
import { LockOpenIcon } from '@heroicons/vue/outline'
import Logo from "@/components/Logo";

export default {
  name: 'Index',
  components: {
    Logo,
    LockOpenIcon
  },
  title() {
    return 'XE Wallet » Create or restore a wallet'
  }
}
</script>
