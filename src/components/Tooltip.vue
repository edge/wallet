<template>
  <div class="tooltip-box">
    <slot />
    <div class="tooltip">
      <span class="text">{{ text }}</span>
    </div>
  </div>
</template>

<script>

export default {
  name: 'Tooltip',
  props: {
    text: {
      type: String,
      required: true
    }
  }
}
</script>

<style scoped>
  .tooltip-box { 
    position: relative;
    display: inline-block;
  }

  .tooltip-box:hover .tooltip {
    opacity: 1;
  }

  .tooltip { 
    color: #ffffff;
    text-align: center;
    padding: 5px 0;
    border-radius: 2px;
    
    width: 120px;
    bottom: 100%;
    left: 50%;
    margin-left: -60px;

    opacity: 0;
    transition: opacity 1s;

    position: absolute;
    z-index: 1;

    background: #0ecc5f;
  }

  .text::after {
    content: " ";
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #0ecc5f transparent transparent transparent;
  }
</style>
