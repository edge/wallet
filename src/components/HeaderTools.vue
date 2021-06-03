
<template>
  <ul class="header-tools">
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
  </ul>
</template>

<script>
  import {SupportIcon} from "@heroicons/vue/solid";
  import {LockOpenIcon} from "@heroicons/vue/outline";
  export default {
    name: "HeaderTools",
    components: {SupportIcon, LockOpenIcon}
  }
</script>

<style scoped>
  .header-tools {
    @apply mt-auto px-15 flex-shrink-0;
  }

  .header-tools__link {
    @apply flex items-center text-gray transition-colors hover:text-white p-12 block;
  }

  .header-tools__icon {
    @apply block flex-shrink-0 mr-7 w-16;
  }

  @screen md {
    .header-tools {
      @apply flex flex-wrap mt-0 px-0;
    }

    .header-tools__item {
      @apply flex flex-wrap ml-32;
    }

    .header-tools__link {
      @apply p-0;
    }
  }

  @screen lg {
    .header-tools {
      @apply ml-32;
    }
  }

  @screen xl {
    .header-tools {
      @apply ml-48;
    }
  }
</style>