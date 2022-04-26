<template>
  <div class="flex flex-col h-full">
    <h3>{{ title }}</h3>
    <div class="relative max-h-full tile md:pr-50">
      <Line
        :chart-options="chartOptions"
        :chart-data="chartData"
        :chart-id="'NodesDataInOutChart'"
        :height="height"
      />
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'
import { Line } from 'vue-chartjs'

export default {
  name: 'NodesChartDataInOut',
  components: { Line },
  data() {
    return {
      chartData: {
        labels: this.timeSeries,
        datasets: this.datasets
      },
      chartOptions: {
        responsive: true,
        cubicInterpolationMode: 'monotone',
        scales: {
          y: {
            beginAtZero: true,
            grid: {display: false},
            suggestedMax: (this.yMax * 1.1) || 0,
            title: {
              display: true,
              text: this.yLabel
            },
            stacked: this.stacked
          },
          x: {
            beginAtZero: true,
            grid: {display: false},
            title: {
              display: true,
              text: this.xLabel
            }
          }
        },
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            interaction: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: (tooltipItem) => `${tooltipItem.dataset.label}: ${tooltipItem.raw.toFixed(2)} ${this.unit}`
              }
            }
          },
          hover: {
            mode: 'index',
            intersect: false
          }
        }
      }
    }
  },
  props: {
    datasets: {
      type: Array,
      default: () => []
    },
    height: {
      type: Number,
      default: 200
    },
    pointRadius: {
      type: Number,
      defult: 5
    },
    stacked: {
      type: Boolean,
      default: false
    },
    timeSeries: {
      type: Array,
      default: () => []
    },
    title: {
      type: String,
      default: () => 'Total Data In/Out'
    },
    xLabel: {
      type: String,
      default: 'Time (hour)'
    },
    yLabel: {
      type: String,
      default: 'KB'
    },
    yMax: {
      type: Number,
      default: 0
    }
  },
  computed: {
    unit() {
      return this.yLabel.substring(6, 8)
    }
  }
}
</script>

<style scoped>
.tile {
  @apply flex-1 p-12 md:p-24 text-sm text-gray-300 bg-white rounded;
}
</style>
