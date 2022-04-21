<template>
  <div class="flex flex-col h-full">
    <h3>Requests</h3>
    <div class="relative max-h-full tile md:pr-50">
      <Line
        :chart-options="chartOptions"
        :chart-data="chartData"
        :chart-id="'NodeRequestsChart'"
        :height="height"
      />
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'
import { Line } from 'vue-chartjs'

export default {
  name: 'NodesChartRequests',
  components: { Line },
  data() {
    return {
      chartData: {
        labels: this.timeSeries,
        datasets: [
          {
            backgroundColor: 'rgba(14, 204, 95, 0.6)',
            borderColor: 'rgb(14, 204, 95)',
            data: this.data,
            fill: true,
            label: 'Requests',
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
            suggestedMax: 5,
            grid: {display: false},
            title: {
              display: true,
              text: 'Requests'
            },
            ticks: {
              stepSize: 1
            }
          },
          x: {
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
              intersect: false
            }
          }
        }
      }
    }
  },
  props: {
    data: {
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
    }
  }
}
</script>

<style scoped>
.tile {
  @apply flex-1 p-12 md:p-24 text-sm text-gray-300 bg-white rounded;
}
</style>
