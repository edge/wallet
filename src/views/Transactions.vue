<template>
  <div>
    <Header />
    <AccountPanel/>

    <div class="bg-gray-200 py-35">
      <div class="container">
        <TransactionsTable
          :limit="limit"
          :receiveMetadata="onTransactionsUpdate"
          :page="currentPage"
          :sortable="true"
        />
        <Pagination
          v-if="metadata.totalCount > limit"
          baseRoute="Transactions"
          :currentPage="currentPage"
          :limit="limit"
          :totalCount="metadata.totalCount"
        />
      </div>
    </div>
  </div>
</template>

<script>
import AccountPanel from '@/components/AccountPanel'
import Header from '@/components/Header'
import Pagination from '@/components/PaginationNew'
import TransactionsTable from '@/components/TransactionsTable'

export default {
  name: 'ViewTransactions',
  title: 'Transactions',
  data: function () {
    return {
      metadata: { totalCount: 0 },
      limit: 20
    }
  },
  components: {
    AccountPanel,
    Header,
    Pagination,
    TransactionsTable
  },
  computed: {
    currentPage() {
      return Math.max(1, parseInt(this.$route.query.page) || 1)
    },
    lastPage() {
      return Math.max(1, Math.ceil(this.metadata.totalCount / this.limit))
    }
  },
  methods: {
    onTransactionsUpdate(metadata) {
      this.metadata = metadata
    }
  },
  watch: {
    metadata() {
      const numRegEx = /^[-+]?\d*$/
      if (this.$route.query.page) {
        if (this.$route.query.page < 1 || !numRegEx.test(this.$route.query.page)) {
          this.$router.replace({ query: { ...this.$route.query, page: 1 } })
        }
      }
      if (this.currentPage > this.lastPage) this.$router.replace({ query: { page: this.lastPage } })
    }
  }
}
</script>
