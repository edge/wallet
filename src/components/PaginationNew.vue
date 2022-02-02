<template>
  <nav class="pagination">
    <ol class="pagination__list">
      <li class="pagination__item">
        <router-link
          v-if="currentPage !== 1"
          @click="setFirstPage"
          :to="{ name: baseRoute, params: { page: 1 }}"
        >
          First
        </router-link>
        <span class="not-link" v-else>First</span>
      </li>
      <li class="pagination__item">
        <router-link
          v-if="currentPage !== 1"
          @click="setPrevPage"
          :to="{ name: baseRoute, params: { page: currentPage - 1 }}"
        >
          <ChevronLeftIcon/>
        </router-link>
        <span class="not-link" v-else><ChevronLeftIcon/></span>
      </li>
      <li class="pagination__item">
        <span v-if="totalPages">
          Page {{Number(currentPage).toLocaleString()}} of {{Number(totalPages).toLocaleString()}}
        </span>
        <span v-else>&nbsp;</span>
      </li>
      <li class="pagination__item">
        <router-link
         v-if="currentPage < totalPages"
          @click="setNextPage"
         :to="{ name: baseRoute, params: { page: currentPage + 1 }}"
        >
          <ChevronRightIcon/>
        </router-link>
        <span class="not-link" v-else><ChevronRightIcon/></span>
      </li>
      <li class="pagination__item">
        <router-link
          v-if="currentPage < totalPages"
          @click="setLastPage"
          :to="{ name: baseRoute, params: { page: totalPages }}"
        >
          Last
        </router-link>
        <span class="not-link" v-else>Last</span>
      </li>
    </ol>
  </nav>
</template>

<script>
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/vue/solid";

export default {
  name: "Pagination",
  components: {ChevronRightIcon, ChevronLeftIcon},
  props: [
    'baseRoute',
    'changePage',
    'currentPage',
    'limit',
    'totalCount'
  ],
  computed: {
    totalPages() {
      return Math.ceil(this.totalCount / this.limit)
    }
  },
  methods: {
    setFirstPage() {
      this.changePage(1)
    },
    setLastPage() {
      this.changePage(this.totalPages)
    },
    setNextPage() {
      this.changePage(this.currentPage + 1)
    },
    setPrevPage() {
      this.changePage(this.currentPage - 1)
    }
  }
}
</script>

<style scoped>
.pagination {
  @apply mt-10;
}

.pagination__list {
  @apply flex items-center flex-wrap justify-center md:justify-end text-sm2 space-x-4;
}

.pagination__item {
  @apply bg-white rounded text-gray-400;
}

.pagination__item a, .pagination__item span {
  @apply py-6 px-12 block;
}

.pagination__item a {
  @apply hover:text-green;
}

.pagination__item span.not-link {
  @apply opacity-25;
}

.pagination__item .active {
  @apply text-green;
}

.pagination__item svg {
  @apply w-18;
}
</style>