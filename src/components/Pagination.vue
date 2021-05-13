<template>
  <nav class="pagination">
    <ol class="pagination__list">
      <li class="pagination__item">
        <router-link to="/">
          <ChevronLeftIcon/>
        </router-link>
      </li>
      <li class="pagination__item">
        <router-link to="/">1</router-link>
      </li>
      <li class="pagination__item">
        <router-link to="/">2</router-link>
      </li>
      <li class="pagination__item">
        <span>...</span>
      </li>
      <li class="pagination__item">
        <span class="active">4</span>
      </li>
      <li class="pagination__item">
        <router-link to="/">5</router-link>
      </li>
      <li class="pagination__item">
        <router-link to="/">
          <ChevronRightIcon/>
        </router-link>
      </li>
    </ol>
  </nav>
</template>

<script>
import {ChevronLeftIcon, ChevronRightIcon} from "@heroicons/vue/solid";

export default {
  name: "Pagination",
  components: {ChevronRightIcon, ChevronLeftIcon}
}
</script>

<style scoped>
.pagination {
  @apply py-6;
}

.pagination__list {
  @apply flex items-center -mx-4 flex-wrap justify-center;
}

.pagination__item {
  @apply px-4 text-md;
}

.pagination__item a {
  @apply text-md hover:text-green;
}

.pagination__item .active {
  @apply text-green;
}

.pagination__item svg {
  @apply w-16;
}
</style>