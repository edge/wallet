<template>
  <div class="account-panel">
    <div class="container">
      <div class="account-panel__address">
        Wallet address: <span>{{ wallet }}</span>
      </div>
      <div class="account-panel__info">
        <div class="account-panel__balance">
          <h3>
            Balance
          </h3>
          <h1>
            {{ balance }}<sub>XE</sub>
          </h1>
        </div>
        <div class="account-panel__buttons">
          <a href="#" class="button button--outline-success w-full">Send</a>
          <a href="#" class="button button--outline-success w-full">Receive</a>
          <a href="#" class="button button--outline-success w-full">Exchange</a>
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
  @apply bg-black-100 pt-16 pb-9;
}

.account-panel__address {
  @apply text-gray text-sm2 mb-7;
}

.account-panel__address span {
  @apply text-white break-all block;
}

.account-panel__info h3 {
  @apply text-green mb-5;
}

.account-panel__info h1 {
  @apply text-white mb-0 font-normal;
}

.account-panel__info h1 sub {
  @apply bottom-0 text-half;
}

.account-panel__buttons {
  @apply grid gap-24 grid-cols-1  w-full flex-shrink-0;
}

.account-panel__balance {
  @apply flex-grow mb-6;
}

@screen md {
  .account-panel__address {
    @apply text-right pr-9 mb-12;
  }

  .account-panel__info {
    @apply flex items-center justify-between;
  }

  .account-panel__address span {
    @apply inline;
  }

  .account-panel__buttons {
    @apply grid-cols-3 max-w-560;
  }
  .account-panel__balance {
    @apply mb-0;
  }
}
</style>