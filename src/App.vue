<template>
  <div id="app" class="app">
    <router-view :key="$route.fullPath" />
  </div>
</template>

<script>
export default {
  title() {
    return 'XE Wallet'
  },
  methods: {
    setViewHeight: function() {
      const vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    }
  },
  mounted: function() {
    this.setViewHeight()
    window.addEventListener('resize', () => {
      this.setViewHeight()
    })
  }
}
</script>

<style>
.app {
  @apply bg-gray-200 h-screen;
}
</style>
