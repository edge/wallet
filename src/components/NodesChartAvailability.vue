<template>
  <div class="flex flex-col h-full">
    <h3>{{ datasets.length > 1 ? '' : 'Average ' }}Availability</h3>
    <div class="relative max-h-full tile md:pr-50">
      <Line
        :chart-options="chartOptions"
        :chart-data="chartData"
        :chart-id="'NodesAvailabilityChart'"
        :height="height"
      />
    </div>
  </div>
</template>

<script>
import Chart from 'chart.js/auto'
import { Line } from 'vue-chartjs'

export default {
  name: 'NodesChartAvailability',
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
            suggestedMax: 100,
            title: {
              display: true,
              text: 'Availability (%)'
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
              intersect: false,
              callbacks: {
                label: (tooltipItem) => `${tooltipItem.dataset.label}: ${tooltipItem.raw.toFixed(2)} %`
              }
            }
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
