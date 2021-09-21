<template>
  <div>
    <slot name="opener" :open="showModal"></slot>
    <transition name="modal-fade">
      <div v-if="isShow" class="modal-backdrop">
        <div class="modal-outer">

          <div
            class="inline-block w-full py-10 overflow-hidden align-bottom sm:py-30 sm:align-middle"
            :style="{ maxWidth: width ? `${width}px` : '36rem' }"
          >
            <div
              v-click-outside="closeHandler ? closeHandler : onClickOutside"
              class="modal"
            >
              <header class="modal-header">
                <slot name="header"></slot>
                <button
                    type="button"
                    class="btn-close"
                    @click="closeHandler ? closeHandler() : closeModal()"
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
    props: ['disallowClickOutside', 'withCloseButton', 'opened', 'closeHandler'],
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
        if (disallowClickOutside) {

        } else {
          this.closeModal()
        }
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
    @apply fixed inset-0 z-10 overflow-y-auto bg-black bg-opacity-70;
  }

  .modal-outer {
    @apply flex items-center justify-center min-h-screen px-10 sm:px-30 md:px-0;
  }

  .modal {
    @apply w-full bg-black-100 flex flex-col rounded-md text-white mx-auto;
  }

  .modal-header {
    @apply relative pt-21 px-24 text-white border-gray-700 border-b-default border-opacity-30;
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
