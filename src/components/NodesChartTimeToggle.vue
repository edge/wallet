<template>
  <div class="flex justify-end">
    <div class="toggle-wrapper">
      <span class="toggle" @click="onPeriodUpdate('day')" :class="isSelected('day') && 'selected'">24 hours</span>
      <span class="toggle" @click="onPeriodUpdate('week')" :class="isSelected('week') && 'selected'">7 days</span>
      <span class="toggle" @click="onPeriodUpdate('month')" :class="isSelected('month') && 'selected'">30 days</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'NodesChartTimeToggle',
  props: {
    onPeriodUpdate: {
      type: Function
    },
    period: {
      type: String,
      default: 'day'
    }
  },
  methods: {
    isSelected(period) {
      return this.period === period
    }
  }
}
</script>

<style scoped>
.toggle-wrapper {
  @apply flex items-center mb-15 justify-end rounded border border-solid;
  border-color: #afafaf
}

.toggle {
  @apply text-gray p-5 w-80 text-center text-xs cursor-pointer border-solid uppercase;
  border-color: #afafaf
}

.toggle:nth-child(2) {
  border-right: solid 1px;
  border-left: solid 1px;
  border-color: #afafaf
}

.toggle.selected {
  @apply text-white;
  background-color: rgb(14, 204, 95);
}
</style>
