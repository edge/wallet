<template>
  <div>
    <slot name="opener" :open="showModal"></slot>
    <transition name="modal-fade">
      <div class="modal-backdrop" v-if="isShow">
        <div class="modal" v-click-outside="closeHandler ? closeHandler : onClickOutside">
          <header class="modal-header">
            <slot name="header"></slot>
            <button
                type="button"
                class="btn-close"
                @click="closeModal"
                v-if="withCloseButton"
            >
              <XIcon />
            </button>
          </header>

          <section class="modal-body">
            <slot name="body" :close="closeModal" :open="showModal"></slot>
          </section>

          <footer class="modal-footer">
            <slot name="footer" :close="closeModal" :open="showModal"></slot>
          </footer>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
  import vClickOutside from 'click-outside-vue3'
  import { XIcon } from '@heroicons/vue/solid';
  export default {
    name: 'Modal',
    props: ['withCloseButton', 'opened', 'closeHandler'],
    directives: {
      clickOutside: vClickOutside.directive
    },
    components: {
      XIcon
    },
    data: function () {
      return {
        isShow: !!this.opened
      }
    },
    methods: {
      onClickOutside() {
        this.closeModal()
      },
      showModal() {
        this.isShow = true
      },
      closeModal() {
        this.isShow = false
      }
    }
  }
</script>

<style scoped>
  .modal-backdrop {
    @apply fixed top-0 left-0 right-0 bottom-0 bg-black bg-opacity-50 grid items-center py-20 px-20 z-50 overflow-auto;
  }

  .modal {
    @apply w-full bg-black-100 flex flex-col rounded-md text-white max-w-612 mx-auto;
  }

  .modal-header {
    @apply relative py-21 px-24 text-white;
  }


  .modal-body {
    @apply relative py-21 px-24 text-white;
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