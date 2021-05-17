<template>
  <label class="fake-radio mb-5 mr-8 cursor-pointer" :for="id">
    <input type="radio" :name="name" class="fixed -left-full -top-full" :id="id">
    <span class="fake-input block text-gray uppercase text-xs border border-green-200 border-opacity-70 rounded p-4 min-w-48 text-center tracking py-2 px-5 hover:bg-green-200 border-opacity-100 hover:text-white transition-all">{{label}}</span>
  </label>
</template>

<script>
  export default {
    name: "Radio",
    props: ['name', 'label', 'id'],
  }
</script>
<style scoped>
  .fake-radio input[type=radio]:checked+.fake-input {
    @apply bg-green-200 text-white border-opacity-100;
  }
</style>