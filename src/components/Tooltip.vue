<template>
  <div class="tooltip-box">
    <slot />
    <div class="tooltip" :class="theme === 'dark' ? 'dark' : 'light'">
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
    }
  }
}
</script>

<style scoped>
  .tooltip-box { 
    @apply relative inline-block;
  }

  .tooltip-box:hover .tooltip {
    @apply opacity-100 -translate-y-8;
  }

  .tooltip { 
    @apply p-10 text-xs absolute bottom-full left-7 transform -translate-x-1/2 w-180 transition duration-200 text-white text-center shadow rounded opacity-0 z-10 bg-green;
  }

  .tooltip.dark {
    @apply bg-black-100 border border-green;
  }

  .text::after {
    content: " ";
    @apply absolute top-full left-1/2 -ml-5;
    border-width: 5px;
    border-style: solid;
    border-color: #0ecc5f transparent transparent transparent;
  }
</style>
