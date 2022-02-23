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
    'sortQuery',
    'sortParam',
    'width'
  ],
  methods: {
    isAscending(expression) {
      // check if expression is present is sorting query, but not preceded by a hyphen
      // also, for multi-word expressions, check no word is preceded by hyphen
      const regex = new RegExp('(?<!-)' + expression.replace(',', ',(?<!-)'))
      return regex.test(this.sortQuery)
    },
    isDescending(expression) {
      const regex = new RegExp(`-${expression.replace(',', ',-')}`)
      return regex.test(this.sortQuery)
    },
    updateSorting(sortParam) {
      // sorting logic is:
      // - if param already at front of list, toggle between descending > ascending > remove > descending
      // - if param already in sorting list, bring to front (as descending)
      // - if param not in list, add to front of list (as descending)

      // some sortParams will have multiple words (e.g. 'released,unlockRequested') so need hyphen at start of each word
      const sortRegexStr = '-?' + sortParam.replace(',', ',-?') + ',?'
      // startRegex - expression at start of sort query only
      // midRegex - expression in middle or at end of sort query
      // fullRegex - expression matches full query (i.e. only one sort param present)
      const startRegex = new RegExp('^' + sortRegexStr)
      const midRegex = new RegExp(sortRegexStr)
      const fullRegex = new RegExp(`^${sortRegexStr}$`)

      if (!this.sortQuery) this.onSortingUpdate(`-${sortParam.replace(',', ',-')}`)
      else if (startRegex.test(this.sortQuery)) {
        let replaceString = sortParam
        if (!fullRegex.test(this.sortQuery)) replaceString += ','
        if (this.sortQuery[0] === '-') this.onSortingUpdate(this.sortQuery.replace(startRegex, replaceString))
        else this.onSortingUpdate(this.sortQuery.replace(startRegex, ''))
      }
      else {
        let sortParamDesc = `-${sortParam.replace(',', ',-')}`
        // if there are more sort params, add comma after new sort param, plus remove any trailing commas and whitespace
        if (this.sortQuery) sortParamDesc += ',' + this.sortQuery.replace(midRegex, '').replace(/,$/, '')
        this.onSortingUpdate(sortParamDesc)
      }
    }
  }
}
</script>

<style scoped>
th {
  @apply font-normal text-sm2 text-left text-black bg-gray-100 border-b-2 border-gray-200 py-13 px-5 cursor-pointer;
}

th.amount-col {
  @apply text-right
}

th .icon {
  @apply w-15 inline-block align-middle text-gray-400;
}
</style>

