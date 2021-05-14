<template>
  <a href="#" class="nav-opener md:hidden">
    <span></span>
  </a>
</template>

<script>

  export default {
    name: "BurgerButton",
  }
</script>
<style scoped>
  .nav-opener {
    position:relative;
    border-radius: 3px;
    margin: 11px 0 0;
  }

  .nav-opener:before,
  .nav-opener:after,
  .nav-opener span {
    border-radius: 4px;
    position: absolute;
    top: 50%;
    left: 25%;
    right: 25%;
    height: 4px;
    margin-top: -2px;
  }

  .nav-opener:after,
  .nav-opener:before {
    content:'';
    top: 30%;
  }

  .nav-opener:after {
    top: 70%;
  }
</style>