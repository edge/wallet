<template>
  <span class="amount" :class="{'sub': sub}">
    <span class="value" v-html="formattedValue"/>
    <sub v-if="currency && sub" class="currency">{{currency}}</sub>
    <span v-else-if="currency" class="currency">{{currency}}</span>
  </span>
</template>

<script>
import * as xe from '@edge/xe-utils'

export default {
  // eslint-disable-next-line vue/multi-word-component-names
  name: 'Amount',
  props: {
    currency: String,
    decimalPlaces: Number,
    short: Boolean,
    sub: Boolean,
    value: [Number, String]
  },
  computed: {
    isXE() {
      return this.currency === '$EDGE' || this.currency === '' || this.currency === undefined
    },
    formattedValue() {
      if (this.value === undefined) return '...'
      if (isNaN(this.value)) return '&mdash;'
      if (typeof this.value === 'string') return this.value
      if (this.isXE && !this.short) {
        return xe.xe.format(this.value, true)
      }
      return this.value.toLocaleString('en-US', { maximumFractionDigits: this.decimalPlaces || 6 })
    }
  }
}
</script>
