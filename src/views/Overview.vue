<template>
  <Header/>
  <AccountPanel />
  <div class="bg-gray-200 py-9">
    <div class="container">
      <Overviews :overviews="overviews"/>
    </div>
  </div>
</template>

<script>

import Header from "@/components/Header";
import Overviews from "@/components/Overviews";
import AccountPanel from "@/components/AccountPanel";

export default {
  name: 'Overview',
  data: function () {
    return {
      overviews: [
        {
          date: 'TODAY',
          items: [
            {
              head: {
                type: 'Sent',
                amount: 387.9270987
              },
              description: {
                date: '16/04/2021 13:06',
                address: 'dy781263f81726817638176sf875gok90',
                id: 'dy781263f81726817638176sf875gok90',
                description: 'Lorem ipsum dolor',
              }
            },
            {
              head: {
                type: 'Received',
                amount: 24.67356
              },
              description: {
                date: '16/04/2021 13:06',
                address: 'dy781263f81726817638176sf875gok90',
                id: 'dy781263f81726817638176sf875gok90',
                description: 'Lorem ipsum dolor',
              }
            },
            {
              head: {
                type: 'Sent',
                amount: 387.9270987
              },
              description: {
                date: '16/04/2021 13:06',
                address: 'dy781263f81726817638176sf875gok90',
                id: 'dy781263f81726817638176sf875gok90',
                description: 'Lorem ipsum dolor',
              }
            }
          ]
        },
        {
          date: '09 april 2021',
          items: [
            {
              head: {
                type: 'Sent',
                amount: 387.9270987
              },
              description: {
                date: '16/04/2021 13:06',
                address: 'dy781263f81726817638176sf875gok90',
                id: 'dy781263f81726817638176sf875gok90',
                description: 'Lorem ipsum dolor',
              }
            },
            {
              head: {
                type: 'Received',
                amount: 24.67356
              },
              description: {
                date: '16/04/2021 13:06',
                address: 'dy781263f81726817638176sf875gok90',
                id: 'dy781263f81726817638176sf875gok90',
                description: 'Lorem ipsum dolor',
              }
            },
            {
              head: {
                type: 'Sent',
                amount: 387.9270987
              },
              description: {
                date: '16/04/2021 13:06',
                address: 'dy781263f81726817638176sf875gok90',
                id: 'dy781263f81726817638176sf875gok90',
                description: 'Lorem ipsum dolor',
              }
            },
            {
              head: {
                type: 'Sent',
                amount: 387.9270987
              },
              description: {
                date: '16/04/2021 13:06',
                address: 'dy781263f81726817638176sf875gok90',
                id: 'dy781263f81726817638176sf875gok90',
                description: 'Lorem ipsum dolor',
              }
            },
            {
              head: {
                type: 'Received',
                amount: 24.67356
              },
              description: {
                date: '16/04/2021 13:06',
                address: 'dy781263f81726817638176sf875gok90',
                id: 'dy781263f81726817638176sf875gok90',
                description: 'Lorem ipsum dolor',
              }
            },
            {
              head: {
                type: 'Sent',
                amount: 387.9270987
              },
              description: {
                date: '16/04/2021 13:06',
                address: 'dy781263f81726817638176sf875gok90',
                id: 'dy781263f81726817638176sf875gok90',
                description: 'Lorem ipsum dolor',
              }
            }
          ]
        }
      ]
    }
  },
  components: {
    AccountPanel,
    Overviews,
    Header
  }
}
</script>
