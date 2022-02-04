å<template>
  <div v-if="visible" class="modal-backdrop">
    <div class="modal-outer">
      <div class="inline-block w-full py-10 overflow-hidden align-bottom sm:py-30 sm:align-middle" :style="getStyle()">
        <div class="modal">
          <header class="modal-header">
            <slot name="header"></slot>
            <button v-if="showCloseButton" type="button" class="btn-close" @click="close">
              <XIcon/>
            </button>
          </header>

          <section class="modal-body">
            <slot name="body"></slot>
          </section>

          <footer class="modal-footer">
            <slot name="footer"></slot>
          </footer>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { XIcon } from '@heroicons/vue/solid'
export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Modal',
  props: {
    close: Function,
    showCloseButton: Boolean,
    visible: Boolean,
    width: Number
  },
  components: {
    XIcon
  },
  methods: {
    getStyle() {
      return {
        maxWidth: this.width ? `${this.width}px` : '36rem'
      }
    }
  }
}
</script>

<style scoped>
  .modal-backdrop {
    @apply fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-70;
  }

  .modal-outer {
    @apply flex items-center justify-center min-h-screen px-10 sm:px-30 md:px-0;
  }

  .modal {
    @apply w-full bg-black-100 flex flex-col rounded-md text-white mx-auto;
  }

  .modal-header {
    @apply relative pt-21 px-24 text-white;
  }


  .modal-body {
    @apply relative pt-20 px-24 text-white;
  }

  .btn-close {
    @apply text-white w-32 top-20 absolute right-20 hover:text-green focus:outline-none;
  }


  .modal-fade-enter,
  .modal-fade-leave-to {
    @apply opacity-0;
  }

  .modal-fade-enter-active,
  .modal-fade-leave-active {
    @apply transition-opacity duration-500 ease-in-out;
  }
</style>
