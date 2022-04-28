<template>
  <th :class="classes" :width="width" @click="updateSorting">
    {{ header }}
    <span class="mr-1 -mt-2 icon">
      <ChevronUpIcon v-if="isAscending" />
      <ChevronDownIcon v-else-if="isDescending"/>
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
  computed: {
    isAscending() {
      if (!this.isDescending) {
        const regex = new RegExp(this.sortParam)
        return regex.test(this.sortQuery)
      }
      else return false
    },
    isDescending() {
      const regex = new RegExp(`-${this.sortParam.replace(',', ',-')}`)
      return regex.test(this.sortQuery)
    },
    sortRegexStr() {
      // some sortParams will have multiple words (e.g. 'released,unlockRequested')
      // regex needs hyphen at start of each word
      return `-?${this.sortParam.replace(',', ',-?')},?`
    },
    startRegex() {
      // sort param found at start of sort query only
      return new RegExp('^' + this.sortRegexStr)
    },
    midRegex() {
      // sort param found in middle or at end of sort query
      return new RegExp(this.sortRegexStr)
    },
    fullRegex() {
      // sort param matches full sort query (i.e. only one sort param present)
      return new RegExp(`^${this.sortRegexStr}$`)
    },
    sortParamDesc() {
      return `-${this.sortParam.replace(',', ',-')}`
    }
  },
  methods: {
    updateSorting() {
      // sorting logic is:
      // - if param already at front of list, toggle between descending > ascending > remove > descending
      // - if param already in sorting list, bring to front (as descending)
      // - if param not in list, add to front of list (as descending)
      if (!this.sortQuery) this.onSortingUpdate(this.sortParamDesc)
      else if (this.startRegex.test(this.sortQuery)) {
        let replaceString = this.sortParam
        if (!this.fullRegex.test(this.sortQuery)) replaceString += ','
        if (this.sortQuery[0] === '-') this.onSortingUpdate(this.sortQuery.replace(this.startRegex, replaceString))
        else this.onSortingUpdate(this.sortQuery.replace(this.startRegex, ''))
      }
      else {
        let newSortQuery = this.sortParamDesc
        if (this.sortQuery) newSortQuery += `,${this.sortQuery.replace(this.midRegex, '').replace(/,$/, '')}`
        this.onSortingUpdate(newSortQuery)
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

