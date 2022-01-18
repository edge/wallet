<template>
  <span class="amount">{{formatted}}<sub class="ml-2">{{currency}}</sub></span>
</template>

<script>
export default {
  name: 'Amount',
  props: {
    currency: String,
    value: [Number, String],
  },
  computed: {
    formatted() {
      if (this.value === undefined || isNaN(this.value)) return '...'
      if (typeof this.value === 'string') return this.value
      return this.value.toLocaleString('en-US', { maximumFractionDigits: 6 })
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
