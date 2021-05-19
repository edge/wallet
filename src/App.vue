<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<script>
export default {
  title() {
    return 'XE Wallet'
  },
  methods: {
    setViewHeight: function() {
      let vh = window.innerHeight * 0.01
      document.documentElement.style.setProperty('--vh', `${vh}px`)
    },
  },
  mounted: function() {
    this.setViewHeight()
    window.addEventListener('resize', () => {
      this.setViewHeight()
    })
  },
}
</script>
