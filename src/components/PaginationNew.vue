<template>
  <nav class="pagination">
    <ol class="pagination__list">
      <li class="pagination__item">
        <router-link
          v-if="currentPage !== 1"
          :to="getNewRoute(1)"
        >
          First
        </router-link>
        <span class="not-link" v-else>First</span>
      </li>

      <li class="pagination__item">
        <router-link
          v-if="currentPage !== 1"
          :to="getNewRoute(prevPage)"
        >
          <ChevronLeftIcon/>
        </router-link>
        <span class="not-link" v-else><ChevronLeftIcon/></span>
      </li>

      <li class="pagination__item">
        <span>
          Page {{ currentPage }} of {{ lastPage }}
        </span>
      </li>

      <li class="pagination__item">
        <router-link
          v-if="currentPage < lastPage"
          :to="getNewRoute(nextPage)"
        >
          <ChevronRightIcon/>
        </router-link>
        <span class="not-link" v-else><ChevronRightIcon/></span>
      </li>

      <li class="pagination__item">
        <router-link
          v-if="currentPage < lastPage"
          :to="getNewRoute(lastPage)"
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
    'currentPage',
    'limit',
    'query',
    'totalCount'
  ],
  computed: {
    lastPage() {
      return Math.ceil(this.totalCount / this.limit)
    },
    prevPage() {
      return this.currentPage - 1
    },
     queryKey() {
      return this.query || 'page'
    },
    nextPage() {
      return this.currentPage + 1
    }
  },
  methods: {
    getNewRoute(newPage) {
      return {
        name: this.baseRoute,
        query: {
          ...this.$route.query,
          [this.queryKey]: newPage
        }
      }
    },
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