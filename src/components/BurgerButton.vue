<template>
  <button type="submit" class="nav-opener md:hidden">
    <span></span>
  </button>
</template>

<script>

export default {
  name: 'BurgerButton'
}
</script>
<style scoped>
  .nav-opener {
    @apply w-38 h-38 bg-green rounded relative focus:outline-none cursor-pointer;
  }

  .nav-opener:before,
  .nav-opener:after,
  .nav-opener span {
    @apply bg-white h-2 absolute top-1/2 left-1/4 right-1/4 transition-all;
  }

  .nav-opener:after,
  .nav-opener:before {
    content:'';
    top: 30%;
  }

  .nav-opener:after {
    top: 70%;
  }

  .menu-open .nav-opener span {
    opacity: 0;
  }

  .menu-open .nav-opener:before,
  .menu-open .nav-opener:after {
    transform: rotate(45deg);
    top: 50%;
    left: 15%;
    right: 15%;
  }

  .menu-open .nav-opener:after {
    transform: rotate(-45deg);
  }
</style>
