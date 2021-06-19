<template>
  <span class="amount">{{ format(value) }}<sub class="ml-2">{{ currency }}</sub></span>
</template>

<script>
export default {
  name: 'Amount',
  props: ['value', 'currency'],
  methods: {
    format(input) {
      return Number(input).toLocaleString('en-US', { maximumFractionDigits: 6 })
    }
  }
}
</script>

<style scoped>
  .amount {
    @apply text-white text-3xl;
  }

  .amount sub {
    @apply text-half bottom-0;
  }
</style>
