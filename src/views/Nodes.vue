<template>
  <div>
    <Header />
    <AccountPanel view="staking" />
    <div class="bg-gray-200 py-35">
      <div class="container">
        <NodesTable
          :limit="limit"
          :receiveMetadata="onNodesUpdate"
          :page="currentPage"
          :sortable="true"
        />
        <Pagination
          v-if="metadata.totalCount > limit"
          baseRoute="Nodes"
          :currentPage="currentPage"
          :limit="limit"
          :totalCount="metadata.totalCount"
        />
      </div>
      <div class="container mt-40" v-if="metadata.totalCount">
        <NodesChartTimeToggle :period="chartPeriod" :onPeriodUpdate="updateChartPeriod" />
        <div class="row mb-25">
          <NodesChartAvailability
            v-if="sessionsStats.average.length"
            :data="chartAvailabilityAverage"
            :xLabel="xLabel"
            :timeSeries="timeSeries"
            :height="isSmView ? 400 : 200"
            :pointRadius="isSmView ? 2 : 3"
          />
          <NodesChartRequests
            v-if="sessionsStats.sum.length"
            :data="chartRequestsSum"
            :xLabel="xLabel"
            :timeSeries="timeSeries"
            :height="isSmView ? 400 : 200"
            :pointRadius="isSmView ? 2 : 3"
          />
        </div>
        <div class="row full mb-25">
          <NodesChartDataInOut
            v-if="sessionsStats.sum.length"
            :dataIn="chartDataInSum"
            :dataOut="chartDataOutSum"
            :xLabel="xLabel"
            :timeSeries="timeSeries"
            :height="isSmView ? 400 : isMdView ? 200 : 100"
            :pointRadius="isSmView ? 2 : 3"
            :yLabel="chartDataInOutMb ? 'Data (MB)' : 'Data (KB)'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AccountPanel from '@/components/AccountPanel'
import Header from '@/components/Header'
import NodesChartAvailability from '@/components/NodesChartAvailability'
import NodesChartDataInOut from '@/components/NodesChartDataInOut'
import NodesChartRequests from '@/components/NodesChartRequests'
import NodesChartTimeToggle from '@/components/NodesChartTimeToggle'
import NodesTable from '@/components/NodesTable'
import Pagination from '@/components/PaginationNew'
import { fetchSessionsStats } from '../utils/api'
import { mapState } from 'vuex'
import moment from 'moment'


export default {
  name: 'ViewNodes',
  data: function () {
    return {
      metadata: { totalCount: 0 },
      limit: 20,
      sessionsStats: {average: [], sum: []},
      timeSeries: []
    }
  },
  components: {
    AccountPanel,
    Header,
    NodesChartAvailability,
    NodesChartDataInOut,
    NodesChartRequests,
    NodesChartTimeToggle,
    NodesTable,
    Pagination
  },
  computed: {
    ...mapState(['address']),
    chartAvailabilityAverage() {
      const metrics = []
      this.sessionsStats.average.forEach((step, index) => {
        metrics[this.chartSteps - index - 1] = step.uptime * 100 / this.maxUptime
      })
      return metrics
    },
    chartDataInSum() {
      const metrics = []
      this.sessionsStats.sum.forEach((step, index) => {
        if (this.chartDataInOutMb) metrics[this.chartSteps - index - 1] = step.metrics.cdn.data.in / 1000000
        else metrics[this.chartSteps - index - 1] = step.metrics.cdn.data.in / 1000
      })
      return metrics
    },
    chartDataOutSum() {
      const metrics = []
      this.sessionsStats.sum.forEach((step, index) => {
        if (this.chartDataInOutMb) metrics[this.chartSteps - index - 1] = step.metrics.cdn.data.out / 1000000
        else metrics[this.chartSteps - index - 1] = step.metrics.cdn.data.out / 1000
      })
      return metrics
    },
    chartDataInOutMb() {
      return this.sessionsStats.sum.some(el => el.metrics.cdn.data.in + el.metrics.cdn.data.out > 1000000)
    },
    chartPeriod() {
      const period = this.$route.query.period
      const validPeriods = ['day', 'week', 'month']
      if (validPeriods.includes(period)) return this.$route.query.period
      else return 'day'
    },
    chartRange() {
      if (this.chartPeriod == 'day') return 'hourly'
      else return 'daily'
    },
    chartRequestsSum() {
      const metrics = []
      this.sessionsStats.sum.forEach((step, index) => {
        metrics[this.chartSteps - index - 1] = step.metrics.cdn.requests
      })
      return metrics
    },
    chartSteps() {
      if (this.chartPeriod == 'day') return 24
      if (this.chartPeriod == 'week') return 7
      if (this.chartPeriod == 'month') return 30
      return 24
    },
    currentPage() {
      return Math.max(1, parseInt(this.$route.query.page) || 1)
    },
    isSmView() {
      return window.innerWidth < 640
    },
    isMdView() {
      return window.innerWidth >= 640 && window.innerWidth < 1000
    },
    lastPage() {
      return Math.max(1, Math.ceil(this.metadata.totalCount / this.limit))
    },
    maxUptime() {
      if (this.chartPeriod === 'day') return 3600 * 1000
      return 86400 * 1000
    },
    xLabel() {
      if (this.chartPeriod === 'day') return 'Time'
      if (this.chartPeriod === 'week') return 'Day'
      if (this.chartPeriod === 'month') return 'Date'
      return 'Time'
    }
  },
  methods: {
    onNodesUpdate(metadata) {
      this.metadata = metadata
    },
    updateChartPeriod(newPeriod) {
      const query = { ...this.$route.query, period: newPeriod}
      this.$router.replace({ query })
    },
    async updateSessionsStats() {
      const options = {
        range: this.chartRange,
        count: this.chartSteps
      }
      const snapshots = await fetchSessionsStats(this.address, options)
      await this.updateTimeSeries(snapshots.results.average)
      this.sessionsStats = snapshots.results
    },
    updateTimeSeries(stats) {
      const latestSnapshotPeriod = new Date(stats[0].end)
      if (this.chartPeriod === 'day') {
        const hourLabels = []
        for (let i = 0; i < 24; i++) {
          hourLabels.unshift(moment(latestSnapshotPeriod).subtract(i, 'hours').format('LT'))
        }
        this.timeSeries = hourLabels
      }
      if (this.chartPeriod === 'week') {
        const dayLabels = []
        for (let i = 0; i < 7; i++) {
          dayLabels.unshift(moment(latestSnapshotPeriod).subtract(i + 1, 'days').format('ddd'))
        }
        this.timeSeries = dayLabels
      }
      if (this.chartPeriod === 'month') {
        const dateLabels = []
        for (let i = 0; i < 30; i++) {
          dateLabels.unshift(moment(latestSnapshotPeriod).subtract(i + 1, 'days').format('ll'))
        }
        this.timeSeries = dateLabels
      }
    }
  },
  mounted() {
    this.updateSessionsStats()
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

<style scoped>
.row {
  @apply grid items-start grid-cols-1 gap-24;
  @apply lg:grid-cols-2;
}

.row.full {
  @apply lg:grid-cols-1
}
</style>
