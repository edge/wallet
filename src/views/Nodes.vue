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
            :stacked="true"
            :timeSeries="timeSeries"
            title="Total Data In/Out"
            :height="isSmView ? 400 : isMdView ? 200 : 100"
            :yLabel="isChartTotalDataMb ? 'Data (MB)' : 'Data (KB)'"
          />
        </div>
        <div class="row mb-25">
          <NodesChartAvailability
            v-if="sessionsStats.sum.length"
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
            v-if="sessionsStats.sum.length"
            :datasets="chartIndvsDataIn"
            :xLabel="xLabel"
            :timeSeries="timeSeries"
            title="Data In"
            :height="isSmView ? 400 : 200"
            :yMax="chartDataMaxY"
            :yLabel="isChartIndvDataMb ? 'Data (MB)' : 'Data (KB)'"
          />
          <NodesChartDataInOut
            v-if="sessionsStats.sum.length"
            :datasets="chartIndvsDataOut"
            :xLabel="xLabel"
            :timeSeries="timeSeries"
            title="Data Out"
            :height="isSmView ? 400 : 200"
            :yMax="chartDataMaxY"
            :yLabel="isChartIndvDataMb ? 'Data (MB)' : 'Data (KB)'"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import AccountPanel from '@/components/AccountPanel.vue'
import Header from '@/components/Header.vue'
import NodesChartAvailability from '@/components/NodesChartAvailability.vue'
import NodesChartDataInOut from '@/components/NodesChartDataInOut.vue'
import NodesChartRequests from '@/components/NodesChartRequests.vue'
import NodesChartTimeToggle from '@/components/NodesChartTimeToggle.vue'
import NodesTable from '@/components/NodesTable.vue'
import Pagination from '@/components/PaginationNew.vue'
import { fetchSessionsStats } from '../utils/api'
import { mapState } from 'vuex'
import moment from 'moment'

const edgeGreen = {border: 'rgb(14, 204, 95)', background: 'rgb(110, 224, 159)'}
const edgeRed = {border: 'rgb(220, 60, 60)', background: 'rgb(255, 138, 138)'}

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
    chartAverageAvailability() {
      const metrics = this.sessionsStats.average.map(step => step.uptime * 100 / this.maxUptime).reverse()
      return [this.getDataset(metrics, 'Average Availability', true, edgeGreen)]
    },
    chartIndvsAvailability() {
      return this.getIndvDatasets(step => step.uptime * 100 / this.maxUptime)
    },
    chartIndvsDataIn() {
      return this.getIndvDatasets(step => {
        if (this.isChartIndvDataMb) return step.metrics.cdn.data.in / 1000000
        else return step.metrics.cdn.data.in / 1000
      })
    },
    chartIndvsDataOut() {
      return this.getIndvDatasets(step => {
        if (this.isChartIndvDataMb) return step.metrics.cdn.data.out / 1000000
        else return step.metrics.cdn.data.out / 1000
      })
    },
    chartDataMaxY() {
      let maxValue = 0
      for (const node in this.sessionsStats) {
        if (node.substring(0,2) == 'xe') {
          this.sessionsStats[node].forEach(el => {
            if (el.metrics.cdn.data.in > maxValue) maxValue =  el.metrics.cdn.data.in
            if (el.metrics.cdn.data.out > maxValue) maxValue =  el.metrics.cdn.data.out
          })
        }
      }
      if (maxValue > 1000000) return maxValue / 1000000
      return maxValue
    },
    chartIndvsRequests() {
      return this.getIndvDatasets(step => step.metrics.cdn.requests)
    },
    isChartTotalDataMb() {
      return this.sessionsStats.sum.some(el => el.metrics.cdn.data.in + el.metrics.cdn.data.out > 1000000)
    },
    isChartIndvDataMb() {
      for (const node in this.sessionsStats) {
        if (node.substring(0, 2) == 'xe') {
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
      const metrics = this.sessionsStats.sum.map(step => {
        if (this.isChartTotalDataMb) return step.metrics.cdn.data.in / 1000000
        else return step.metrics.cdn.data.in / 1000
      }).reverse()
      return this.getDataset(metrics, 'Total Data In', true, edgeGreen)
    },
    chartTotalDataOut() {
      const metrics = this.sessionsStats.sum.map(step => {
        if (this.isChartTotalDataMb) return step.metrics.cdn.data.out / 1000000
        else return step.metrics.cdn.data.out / 1000
      }).reverse()
      return this.getDataset(metrics, 'Total Data Out', true, edgeRed)
    },
    chartTotalRequests() {
      const metrics = this.sessionsStats.sum.map(step => step.metrics.cdn.requests).reverse()
      return [this.getDataset(metrics, 'Total Requests', true, edgeGreen)]
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
    getColorFromAddress(address) {
      let hash = 0
      const str = address.substring(3)
      for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash)
      }
      let colour = '#'
      for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xFF
        colour += ('00' + value.toString(16)).substr(-2)
      }
      return colour
    },
    getDataset(data, label, fill, color, dashed) {
      const truncatedLabel = label.substring(0, 2) === 'xe' ? label.substring(0, 7) + '...' + label.substring(38) : label
      const ffColor = this.getColorFromAddress(label)
      const backgroundColor = dashed ? color.border : color ? color.background : ffColor
      const borderColor = color ? color.border : ffColor
      const borderWidth = fill ? 3 : 2
      const pointRadius = this.isSmView ? 2 : 3
      return {
        backgroundColor, borderColor, borderWidth, data, fill,
        label: truncatedLabel,
        borderDash: dashed ? [5, 5] : [],
        pointRadius: fill ? pointRadius : pointRadius - 1,
        pointStyle: dashed ? 'rectRot' : ''
      }
    },
    getIndvDatasets(callback) {
      const avgDataset = this.getDataset(this.sessionsStats.average.map(callback).reverse(), 'Average', false, edgeGreen, true)
      const datasets = [avgDataset]
      for (const node in this.sessionsStats) {
        if (node.substring(0, 2) === 'xe') {
          const metrics = this.sessionsStats[node].map(callback).reverse()
          datasets.push(this.getDataset(metrics, node))
        }
      }
      return datasets
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
      const snapshots = await fetchSessionsStats(this.address, options)
      if (snapshots.results.average) {
        await this.updateTimeSeries(snapshots.results.average)
        this.sessionsStats = snapshots.results
      }
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
