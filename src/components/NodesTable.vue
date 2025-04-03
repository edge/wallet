<template>
  <table>
    <thead class="hidden lg:table-header-group">
      <tr v-if="sortable">
        <TableHeader width="16%" header="Address" :sortQuery="sortQuery"
          sortParam="node.address" :onSortingUpdate="updateSorting" :sortAscFirst="true"
        />
        <!-- currently no sorting on gateway and stargate columns as stargate isn't included in host node's data -->
        <th width="15%">Gateway</th>
        <th width="15%">Stargate</th>
        <TableHeader width="8%" header="Type" :sortQuery="sortQuery"
          sortParam="node.type" :onSortingUpdate="updateSorting" :sortAscFirst="true"
        />
        <TableHeader width="20%" header="Location" :sortQuery="sortQuery"
          sortParam="node.geo.country,node.geo.city" :onSortingUpdate="updateSorting" :sortAscFirst="true"
        />
        <TableHeader width="110" header="Availability" :sortQuery="sortQuery"
          sortParam="sortAvailability" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="8%" header="Status" :sortQuery="sortQuery"
          sortParam="lastActive" :onSortingUpdate="updateSorting"
        />
        <TableHeader width="15%" header="Last Seen" :sortQuery="sortQuery"
          sortParam="lastActive" :onSortingUpdate="updateSorting"
        />
      </tr>
      <tr v-else>
        <th width="16%">Address</th>
        <th width="15%">Gateway</th>
        <th width="15%">Stargate</th>
        <th width="8%">Type</th>
        <th width="20%">Location</th>
        <th width="98">Availability</th>
        <th width="8%">Status</th>
        <th width="12%">Last Seen</th>
      </tr>
    </thead>
    <tbody v-if="nodes.length">
      <NodesTableItem
        v-for="item in nodes"
        :key="item.id"
        :item="item"
      />
    </tbody>
    <tbody v-else-if="!loaded && loading">
      <td colspan="8" class="block w-full text-center bg-white lg:table-cell py-35">
        Loading...
      </td>
    </tbody>
    <tbody v-else>
      <tr>
        <td colspan="8" class="block w-full text-center bg-white lg:table-cell py-35">
          No Nodes.
        </td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import * as index from '@edge/index-utils'
import NodesTableItem from '@/components/NodesTableItem.vue'
import TableHeader from '@/components/TableHeader.vue'
import { mapState } from 'vuex'

const nodesRefreshInterval = 30 * 1000

export default {
  name: 'NodesTable',
  data: function () {
    return {
      loaded: false,
      loading: false,
      metadata: null,
      nodes: [],
      iNodes: null
    }
  },
  components: {
    NodesTableItem,
    TableHeader
  },
  props: [
    'limit',
    'page',
    'receiveMetadata',
    'sortable'
  ],
  computed: {
    ...mapState(['address']),
    sortQuery() {
      return this.$route.query.sort
    }
  },
  mounted() {
    this.updateNodes()
    // initiate polling
    this.iNodes = setInterval(() => {
      this.updateNodes()
    }, nodesRefreshInterval)
  },
  unmounted() {
    clearInterval(this.iNodes)
  },
  methods: {
    async updateNodes() {
      this.loading = true
      // the sort query sent to index needs to include "-created", but this is hidden from user in browser url
      const sortQuery = this.$route.query.sort ? `${this.$route.query.sort},-sortAvailability` : '-sortAvailability'
      const nodes = await index.session.sessions(
        import.meta.env.VITE_INDEX_API_URL,
        this.address,
        {
          limit: this.limit,
          page: this.page,
          sort: sortQuery
        }
      )
      this.nodes = nodes.results
      this.receiveMetadata(nodes.metadata)
      this.loaded = true
      this.loading = false
    },
    updateSorting(newSortQuery) {
      const query = { ...this.$route.query, sort: newSortQuery }
      if (!newSortQuery) delete query.sort
      this.$router.replace({ query })
    }
  },
  watch: {
    page() {
      this.updateNodes()
    },
    sortQuery() {
      this.updateNodes()
    }
  }
}
</script>

<style scoped>
table {
  @apply w-full table-fixed
}

table, tbody, tr {
  @apply block;
}

th {
  @apply font-normal text-sm2 text-left text-black bg-gray-100 border-b-2 border-gray-200 py-13 px-5;
}

th:first-of-type {
  @apply pl-20;
}

th.amount-col {
  @apply text-right
}

th .icon {
  @apply w-15 inline-block align-middle text-gray-400;
}

@screen lg {
  table {
    @apply table;
  }

  tbody {
    @apply table-row-group;
  }

  tr {
    @apply table-row;
  }
}
</style>
