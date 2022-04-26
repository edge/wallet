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
      <!-- <div class="container mt-40" v-if="metadata.totalCount"> -->
      <div class="container mt-40">
        <NodesChartTimeToggle :period="chartPeriod" :onPeriodUpdate="updateChartPeriod" />
        <div class="row mb-25">
          <NodesChartAvailability
            v-if="sessionsStats.average.length"
            :datasets="chartAverageAvailability"
            :xLabel="xLabel"
            :timeSeries="timeSeries"
            :height="isSmView ? 400 : 200"
          />
          <NodesChartRequests
            v-if="sessionsStats.sum.length"
            :datasets="chartTotalRequests"
            :xLabel="xLabel"
            :timeSeries="timeSeries"
            :height="isSmView ? 400 : 200"
          />
        </div>
        <div class="row full mb-25">
          <NodesChartDataInOut
            v-if="sessionsStats.sum.length"
            :datasets="[chartTotalDataOut, chartTotalDataIn]"
            :xLabel="xLabel"
            :timeSeries="timeSeries"
            title="Total Data In/Out"
            :height="isSmView ? 400 : isMdView ? 200 : 100"
            :yLabel="isChartTotalDataMb ? 'Data (MB)' : 'Data (KB)'"
          />
        </div>
        <div class="row mb-25">
          <NodesChartAvailability
            v-if="sessionsStats.average.length"
            :datasets="chartIndvsAvailability"
            :xLabel="xLabel"
            :timeSeries="timeSeries"
            :height="isSmView ? 400 : 200"
          />
          <NodesChartRequests
            v-if="sessionsStats.sum.length"
            :datasets="chartIndvsRequests"
            :xLabel="xLabel"
            :timeSeries="timeSeries"
            :height="isSmView ? 400 : 200"
          />
        </div>
        <div class="row mb-25">
          <NodesChartDataInOut
            v-if="sessionsStats.average.length"
            :datasets="chartIndvsDataIn"
            :xLabel="xLabel"
            :timeSeries="timeSeries"
            title="Data In"
            :height="isSmView ? 400 : 200"
            :yLabel="isChartIndvDataMb ? 'Data (MB)' : 'Data (KB)'"
          />
          <NodesChartDataInOut
            v-if="sessionsStats.sum.length"
            :datasets="chartIndvsDataOut"
            :xLabel="xLabel"
            :timeSeries="timeSeries"
            title="Data Out"
            :height="isSmView ? 400 : 200"
            :yLabel="isChartIndvDataMb ? 'Data (MB)' : 'Data (KB)'"
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
import interpolateRGB from 'interpolate-rgb'
import { mapState } from 'vuex'
import moment from 'moment'

const edgeGreen = {border: [14, 204, 95], background: [110, 224, 159]}
const edgeRed = {border: [220, 60, 60], background: [255, 138, 138]}

export default {
  name: 'ViewNodes',
  data: function () {
    return {
      metadata: { totalCount: 0 },
      limit: 20,
      selectedNodes: [
        'xe_06163EcCB1F9b12D173B3eeaA771E672c5C16203',
        'xe_47d365C7105afd7e6008e9C06fA706607EeE248C',
        'xe_7fEF9b284fb81874A81654fDADe656fCb4f05735',
        'xe_9e2d4A2E0A48F2B1b25ee38A12ad00991E716583',
        'xe_f68d9607CEa938013b440850E77824b0b74B1E22'
      ],
      // selectedNodes: [],
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
    chartAverageAvailability() {
      const metrics = []
      this.sessionsStats.average.forEach((step, index) => {
        metrics[this.chartSteps - index - 1] = step.uptime * 100 / this.maxUptime
      })
      return [this.getDataset(metrics, 0, 1, 'Average Availability', true)]
    },
    chartIndvsAvailability() {
      const datasets = []
      let colorIndex = 0
      for (const node in this.sessionsStats) {
        if (this.selectedNodes.includes(node)) {
          const metrics = []
          this.sessionsStats[node].forEach((step, index) => {
            metrics[this.chartSteps - index - 1] = step.uptime * 100 / this.maxUptime
          })
          datasets.push(this.getDataset(metrics, colorIndex, this.selectedNodes.length - 1, node))
          colorIndex++
        }
      }
      return datasets
    },
    chartIndvsDataIn() {
      const datasets = []
      let colorIndex = 0
      for (const node in this.sessionsStats) {
        if (this.selectedNodes.includes(node)) {
          const metrics = []
          this.sessionsStats[node].forEach((step, index) => {
            if (this.isChartIndvDataMb) metrics[this.chartSteps - index - 1] = step.metrics.cdn.data.in / 1000000
            else metrics[this.chartSteps - index - 1] = step.metrics.cdn.data.in / 1000
          })
          datasets.push(this.getDataset(metrics, colorIndex, this.selectedNodes.length - 1, node))
          colorIndex++
        }
      }
      return datasets
    },
    chartIndvsDataOut() {
      const datasets = []
      let colorIndex = 0
      for (const node in this.sessionsStats) {
        if (this.selectedNodes.includes(node)) {
          const metrics = []
          this.sessionsStats[node].forEach((step, index) => {
            if (this.isChartIndvDataMb) metrics[this.chartSteps - index - 1] = step.metrics.cdn.data.out / 1000000
            else metrics[this.chartSteps - index - 1] = step.metrics.cdn.data.out / 1000
          })
          datasets.push(this.getDataset(metrics, colorIndex, this.selectedNodes.length - 1, node))
          colorIndex++
        }
      }
      return datasets
    },
    chartIndvsRequests() {
      const datasets = []
      let colorIndex = 0
      for (const node in this.sessionsStats) {
        if (this.selectedNodes.includes(node)) {
          const metrics = []
          this.sessionsStats[node].forEach((step, index) => {
            metrics[this.chartSteps - index - 1] = step.metrics.cdn.requests
          })
          datasets.push(this.getDataset(metrics, colorIndex, this.selectedNodes.length - 1, node))
          colorIndex++
        }
      }
      return datasets
    },
    isChartTotalDataMb() {
      return this.sessionsStats.sum.some(el => el.metrics.cdn.data.in + el.metrics.cdn.data.out > 1000000)
    },
    isChartIndvDataMb() {
      for (const node in this.sessionsStats) {
        if (this.selectedNodes.includes(node)) {
          if (this.sessionsStats[node].some(el => el.metrics.cdn.data.in > 1000000 || el.metrics.cdn.data.out > 1000000)) return true
        }
      }
      return false
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
    chartTotalDataIn() {
      const metrics = []
      this.sessionsStats.sum.forEach((step, index) => {
        if (this.isChartTotalDataMb) metrics[this.chartSteps - index - 1] = step.metrics.cdn.data.in / 1000000
        else metrics[this.chartSteps - index - 1] = step.metrics.cdn.data.in / 1000
      })
      return this.getDataset(metrics, 0, 2,'Total Data In', true)
    },
    chartTotalDataOut() {
      const metrics = []
      this.sessionsStats.sum.forEach((step, index) => {
        if (this.isChartTotalDataMb) metrics[this.chartSteps - index - 1] = step.metrics.cdn.data.out / 1000000
        else metrics[this.chartSteps - index - 1] = step.metrics.cdn.data.out / 1000
      })
      return this.getDataset(metrics, 1, 2, 'Total Data Out', true)
    },
    chartTotalRequests() {
      const metrics = []
      this.sessionsStats.sum.forEach((step, index) => {
        metrics[this.chartSteps - index - 1] = step.metrics.cdn.requests
      })
      return [this.getDataset(metrics, 0, 1, 'Total Requests', true)]
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
    getColor(startColor, endColor, percent) {
      const rgb = interpolateRGB(startColor, endColor, percent)
      return `rgb(${rgb[0]}, ${rgb[1]}, ${rgb[2]})`
    },
    getDataset(data, index, dataPoints, label, fill) {
      const pc = index ? index / (dataPoints - 1) : 0
      // use lighter background colour for line graphs with fill
      const backgroundGreen = !fill ? edgeGreen.border : edgeGreen.background
      const backgroundRed = !fill ? edgeRed.border : edgeRed.background
      return {
        backgroundColor: this.getColor(backgroundGreen, backgroundRed, pc),
        borderColor: this.getColor(edgeGreen.border, edgeRed.border, pc),
        data, fill, label,
        pointRadius: this.isSmView ? 2 : 3
      }
    },
    isDataInMb(datasets, sum) {
      if (sum) return this.sessionsStats.sum.some(el => el.metrics.cdn.data.in + el.metrics.cdn.data.out > 1000000)
      else return 
    },
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
      const snapshots = await fetchSessionsStats('xe_3F129e50310Ab4db5e3C7Eb79e177A40a8e9D319', options)
      // const snapshots = await fetchSessionsStats(this.address, options)
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
