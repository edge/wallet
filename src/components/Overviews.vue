<template>
    <div class="overview-items">
      <OverviewItem
        v-for="(item, index) in overviews"
        :key="index"
        :setting="item" />
    </div>
</template>

<script>
import OverviewItem from "@/components/OverviewItem";
import Pagination from "@/components/Pagination";

export default {
  name: "Overviews",
  components: {
    Pagination,
    OverviewItem
  },
  props: ['overviews'],
  methods: {
  }
}
</script>

<style scoped>
  .overview-items {
    max-width: 997px;
    @apply mx-auto;
  }
</style>