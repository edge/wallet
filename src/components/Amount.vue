<template>
  <span class="amount">{{ value }}<sub>{{ currency }}</sub></span>
</template>

<script>
export default {
name: "Amount",
  props: ['value', 'currency']
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