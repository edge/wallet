<template>
  <Header />
  <AccountPanel/>
</template>

<script>
import AccountPanel from "@/components/AccountPanel"
import Header from "@/components/Header"
import StakesTable from "@/components/StakesTable"

export default {
  name: "Staking",
  components: {
    AccountPanel,
    Header,
    StakesTable
  }
}
</script>

