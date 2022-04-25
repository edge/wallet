<template>
  <div class="flex flex-col h-full">
    <h3>Total Data In/Out</h3>
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
        datasets: [
          {
            backgroundColor: 'rgb(255,138,138)',
            borderColor: 'rgb(220, 60, 60)',
            data: this.dataOut,
            fill: true,
            label: 'Data Out',
            pointRadius: this.pointRadius
          },
          {
            backgroundColor: 'rgb(110,224,159)',
            borderColor: 'rgb(14, 204, 95)',
            data: this.dataIn,
            fill: true,
            label: 'Data In',
            pointRadius: this.pointRadius
          }
        ]
      },
      chartOptions: {
        responsive: true,
        cubicInterpolationMode: 'monotone',
        scales: {
          y: {
            beginAtZero: true,
            grid: {display: false},
            title: {
              display: true,
              text: this.yLabel
            },
            stacked: true
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
                label: (tooltipItem) => tooltipItem.raw.toFixed(2) + ` ${this.unit}`
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
    dataIn: {
      type: Array,
      default: () => []
    },
    dataOut: {
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
    timeSeries: {
      type: Array,
      default: () => []
    },
    xLabel: {
      type: String,
      default: 'Time (hour)'
    },
    yLabel: {
      type: String,
      default: 'KB'
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
