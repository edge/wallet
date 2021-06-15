<template>
  <label class="fake-radio cursor-pointer" :class="{ 'fake-radio--big' : big}" :for="id">
    <input type="radio" :name="name" class="fixed -left-full -top-full" :id="id" :checked="selected">
    <span class="fake-input"><span v-if="extraName" class="font-semibold block">{{extraName}}</span>{{label}}</span>
  </label>
</template>

<script>
  export default {
    name: "Radio",
    props: ['name', 'label', 'id', 'extraName', 'big', 'selected']
  }
</script>
<style scoped>
  .fake-radio input[type=radio]:checked+.fake-input {
    @apply bg-green-200 text-white border-opacity-100;
  }
  .fake-radio.fake-radio--big input[type=radio]:checked+.fake-input {
    @apply text-white border-opacity-100 bg-green-200;
  }
  .fake-radio {
    @apply mb-5 mr-8;
  }
  .fake-radio .fake-input {
    @apply block text-gray uppercase text-xs border border-green-200 rounded p-4 min-w-48 text-center tracking py-2 px-5 hover:bg-green-200 border-opacity-100 hover:text-white transition-all;
  }
  .fake-radio.fake-radio--big .fake-input {
    @apply text-gray border border-green-200 bg-transparent border-opacity-100;
  }
  .fake-radio.fake-radio--big {
    @apply w-1/2 px-6 md:w-3/12 mr-0;
  }
  .fake-radio.fake-radio--big .fake-input {
    @apply text-left px-10 py-8;
  }
  .fake-radio.fake-radio--big .fake-input span {
    @apply text-left;
  }
</style>