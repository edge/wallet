<template>
  <div class="tooltip-box">
    <slot />
    <div class="tooltip" :class="theme === 'dark' ? 'dark' : 'light', position || 'top', wide ? 'wide' : ''">
      <span class="text">{{ text }}</span>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Tooltip',
  props: {
    text: {
      type: String,
      required: true
    },
    theme: {
      type: String,
      required: false
    },
    position: {
      type: String,
      required: false
    },
    wide: {
      type: Boolean,
      required: false
    }
  }
}
</script>

<style scoped>
  .tooltip-box {
    @apply relative inline-block cursor-pointer;
  }

  /* visible states */
  .tooltip-box:hover .tooltip {
    @apply opacity-100 visible;
  }
  .tooltip-box:hover .tooltip.top {
    @apply -translate-y-8;
  }

  .tooltip-box:hover .tooltip.bottom {
    @apply translate-y-8;
  }

  .tooltip-box:hover .tooltip.right {
    @apply translate-x-5;
  }

  .tooltip-box:hover .tooltip.left {
    @apply -translate-x-5;
  }

  /* tooltip position */
  .tooltip {
    width: 200px;
    @apply invisible p-10 text-xs absolute transform transition duration-200 text-white text-center shadow rounded opacity-0 z-10 bg-green;
  }

  .tooltip.wide {
    width: 300px;
  }

  .tooltip.top {
    @apply bottom-full left-1/2 -translate-x-1/2;
  }

  .tooltip.bottom {
    @apply top-full left-1/2 -translate-x-1/2;
  }

  .tooltip.right {
    @apply left-full translate-x-0 top-1/2 -translate-y-1/2;
  }

  .tooltip.left {
    @apply right-full translate-x-0 top-1/2 -translate-y-1/2;
  }

  /* theme */
  .tooltip.dark {
    @apply bg-black-100 border border-green !important;
  }

  /* the notch */
  .tooltip .text::after {
    content: " ";
    @apply absolute transform;
    border-width: 5px;
    border-style: solid;
  }
  .tooltip.top .text::after {
    @apply top-full left-1/2 transform -translate-x-1/2;
    border-color: #0ecc5f transparent transparent transparent;
  }

  .tooltip.right .text::after {
    @apply top-1/2 left-0 transform -translate-y-1/2 -translate-x-10;
    border-color: transparent #0ecc5f transparent transparent;
  }

  .tooltip.bottom .text::after {
    @apply bottom-full left-1/2 transform -translate-x-1/2;
    border-color: transparent transparent #0ecc5f transparent;
  }

  .tooltip.left .text::after {
    @apply top-1/2 right-0 transform -translate-y-1/2 translate-x-10;
    border-color: transparent transparent transparent #0ecc5f;
  }
</style>
