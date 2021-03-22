<template>
  <div id="app">
    <router-view/>
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #333333;
}

a, a:visited, a:active {
  text-decoration: none;
  color: black;
}
a:hover {
  text-decoration: underline;
}
</style>

<script>
export default {
  name: 'App',
  metaInfo: {
    title: 'XE Blockchain',
    titleTemplate: 'Edge Wallet » %s',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: 'test meta desc' }
    ],
    link: [
      { rel: 'icon', href: '/img/logo.png' },
      { rel: 'shortcut icon', href: '/img/logo.png' }
    ]
  }
}
</script>
