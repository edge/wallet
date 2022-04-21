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
      <!-- CHART COMPONENTS -->
      <div class="container mt-40">
        <NodesChartTimeToggle :period="chartPeriod" :onPeriodUpdate="updateChartPeriod" />
        <div class="row mb-25">
          <NodesChartAvailability
            v-if="sessionStats.length"
            :data="chartAvailabilityMetrics"
            :xLabel="xLabel"
            :timeSeries="timeSeries"
            :height="isSmView ? 400 : 200"
            :pointRadius="isSmView ? 2 : 3"
          />
          <NodesChartRequests
            v-if="sessionStats.length"
            :data="chartRequestsMetrics"
            :xLabel="xLabel"
            :timeSeries="timeSeries"
            :height="isSmView ? 400 : 200"
            :pointRadius="isSmView ? 2 : 3"
          />
        </div>
        <div class="row full mb-25">
          <NodesChartDataInOut
            v-if="sessionStats.length"
            :dataIn="chartDataInMetrics"
            :dataOut="chartDataOutMetrics"
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

// CHART IMPORTS
import NodesChartAvailability from '@/components/NodesChartAvailability'
import NodesChartDataInOut from '@/components/NodesChartDataInOut'
import NodesChartRequests from '@/components/NodesChartRequests'
import NodesChartTimeToggle from '@/components/NodesChartTimeToggle'

import NodesTable from '@/components/NodesTable'
import Pagination from '@/components/PaginationNew'

// CHART IMPORTS
import { fetchSessionStats } from '../utils/api'
import moment from 'moment'


const testNodes = [
  'xe_06163EcCB1F9b12D173B3eeaA771E672c5C16203',
  'xe_f68d9607CEa938013b440850E77824b0b74B1E22',
  'xe_7fEF9b284fb81874A81654fDADe656fCb4f05735',
  'xe_9e2d4A2E0A48F2B1b25ee38A12ad00991E716583',
  'xe_47d365C7105afd7e6008e9C06fA706607EeE248C'
]


export default {
  name: 'ViewNodes',
  data: function () {
    return {
      metadata: { totalCount: 0 },
      limit: 20,

      // CHART DATA
      sessionStats: [],
      timeSeries: []
    }
  },
  components: {
    AccountPanel,
    Header,

    // CHART COMPONENTS
    NodesChartAvailability,
    NodesChartDataInOut,
    NodesChartRequests,
    NodesChartTimeToggle,

    NodesTable,
    Pagination
  },
  computed: {
    currentPage() {
      return Math.max(1, parseInt(this.$route.query.page) || 1)
    },
    lastPage() {
      return Math.max(1, Math.ceil(this.metadata.totalCount / this.limit))
    },


    // CHART PROPS
    chartAvailabilityMetrics() {
      const metrics = []
      this.sessionStats.forEach((step, index) => {
        metrics[this.chartSteps - index - 1] = step.uptime * 100 / this.maxUptime
      })
      return metrics
    },
    chartDataInMetrics() {
      const metrics = []
      this.sessionStats.forEach((step, index) => {
        if (this.chartDataInOutMb) metrics[this.chartSteps - index - 1] = step.metrics.cdn.data.in / 1000000
        else metrics[this.chartSteps - index - 1] = step.metrics.cdn.data.in / 1000
      })
      return metrics
    },
    chartDataOutMetrics() {
      const metrics = []
      this.sessionStats.forEach((step, index) => {
        if (this.chartDataInOutMb) metrics[this.chartSteps - index - 1] = step.metrics.cdn.data.out / 1000000
        else metrics[this.chartSteps - index - 1] = step.metrics.cdn.data.out / 1000
      })
      return metrics
    },
    chartDataInOutMb() {
      return this.sessionStats.some(el => el.metrics.cdn.data.in + el.metrics.cdn.data.out > 1000000)
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
    chartRequestsMetrics() {
      const metrics = []
      this.sessionStats.forEach((step, index) => {
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
    isSmView() {
      return window.innerWidth < 640
    },
    isMdView() {
      return window.innerWidth >= 640 && window.innerWidth < 1000
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



    // CHART METHODS
    updateChartPeriod(newPeriod) {
      const query = { ...this.$route.query, period: newPeriod}
      this.$router.replace({ query })
    },
    async updateSessionStats() {
      const options = {
        range: this.chartRange,
        count: this.chartSteps
      }
      // const sessionsStats = await Promise.all(testNodes.map(async node => {
      //   const snapshots = await fetchSessionStats(node, options)
      //   return snapshots.results
      // }))
      const snapshots = await fetchSessionStats(testNodes[0], options)
      await this.updateTimeSeries(snapshots.results)
      this.sessionStats = snapshots.results
    },
    updateTimeSeries(stats) {
      let latestSnapshotPeriod = new Date(stats[0].end)
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

  // CHART MOUNTED
  mounted() {
    this.updateSessionStats()
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
