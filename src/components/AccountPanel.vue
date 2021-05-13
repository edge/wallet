<template>
  <div class="account-panel">
    <div class="container">
      <div class="account-panel__address">
        Wallet address: <span>{{ wallet }}</span>
      </div>
      <div class="account-panel__info">
        <div class="acoount-panel__balance">
          <h3>
            Balance
          </h3>
          <h1>
            {{balance}}<sub>XE</sub>
          </h1>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: "AccountPanel",
  data: function () {
    return {
      balance: 1574.987,
      wallet: 'xe_d4D5Fdb4d39A4c38d7Ca02b938049edA73b0fA53'
    }
  }
}
</script>

<style scoped>
  .account-panel {
    @apply bg-black-100 pt-7 pb-10;
  }

  .account-panel__address {
    @apply text-gray text-sm2 text-right;
  }

  .account-panel__address span {
    @apply text-white;
  }

  .account-panel__info h3 {
    @apply text-green mb-0;
  }

  .account-panel__info h1 {
    @apply text-white mb-0 font-normal;
  }

  .account-panel__info h1 sub {
    @apply bottom-0 text-half;
  }
</style>