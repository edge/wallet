<template>
  <div class="flex justify-end">
    <div class="toggle-wrapper">
      <span class="toggle" @click="onPeriodUpdate('day')" :class="isSelected('day') && 'selected'">24 hours</span>
      <span
        class="toggle" @click="onPeriodUpdate('week')"
        :class="
        isSelected('week') && 'selected'
        || isSelected('day') && 'no-left'
        || isSelected('month') && 'no-right'
        "
      >
        7 days
      </span>
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
  @apply flex items-center mb-15 justify-end;
}

.toggle {
  @apply text-gray p-5 w-80 text-center text-xs cursor-pointer border border-solid uppercase;
  border-color: #afafaf
}

.toggle:first-child {
  border-top-left-radius: 0.25rem;
  border-bottom-left-radius: 0.25rem;
  border-right: none;
}
.toggle:last-child {
  border-top-right-radius: 0.25rem;
  border-bottom-right-radius: 0.25rem;
  border-left: none;
}
.toggle.no-left {
  border-left: none;
}
.toggle.no-right {
  border-right: none;
}

.toggle.selected {
  @apply text-white border border-solid;
  background-color: rgb(14, 204, 95);
  border-color: rgb(14, 204, 95)
}
</style>
