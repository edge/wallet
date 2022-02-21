<template>
  <th :class="classes" :width="width" @click="updateSorting(sortParam)">
    {{ header }}
    <span class="mr-1 -mt-2 icon">
      <ChevronUpIcon v-if="isAscending(sortParam)" />
      <ChevronDownIcon v-else-if="isDescending(sortParam)"/>
    </span>
  </th>
</template>

<script>
import { ChevronDownIcon, ChevronUpIcon} from '@heroicons/vue/outline'

export default {
  name: 'TableHeader',
  data: function () {
    return {
    }
  },
  components: {
    ChevronDownIcon,
    ChevronUpIcon
  },
  props: [
    'classes',
    'header',
    'onSortingUpdate',
    'sorting',
    'sortParam',
    'width'
  ],
  methods: {
    isAscending(expression) {
      return this.sorting.includes(expression)
    },
    isDescending(expression) {
      return this.sorting.includes('-' + expression.split(',').join(',-'))
    },
    updateSorting(sortParam) {
      // sorting logic is:
      // - if param not in list, add to front of list (as descending)
      // - if param already in sorting list, bring to front (as descending)
      // - if already at front of list, toggle between descending > ascending > remove > descending

      // some sortParams will have multiple params (e.g. 'released,unlockRequested')
      // regex needs to include a hyphen before every param
      const regex = new RegExp('-?' + sortParam.split(',').join(',-?'), 'g')

      const firstSortParam = this.sorting[0]
      if (regex.test(firstSortParam)) {
        if (firstSortParam[0] === '-') this.onSortingUpdate([sortParam, ...this.sorting.slice(1)])
        else this.onSortingUpdate(this.sorting.slice(1))
      }
      else {
        const descExpression = '-' + sortParam.split(',').join(',-')
        this.onSortingUpdate([descExpression, ...this.sorting.filter(item => !regex.test(item))])
      }
    }
  }
}
</script>

<style scoped>
th {
  @apply font-normal text-sm2 text-left text-black bg-gray-100 border-b-2 border-gray-200 py-13 px-5;
}

th.amount-col {
  @apply text-right
}

th .icon {
  @apply w-15 inline-block align-middle text-gray-400;
}
</style>

