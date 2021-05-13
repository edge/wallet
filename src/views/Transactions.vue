<template>
  <Header/>
  <AccountPanel />
  <div class="bg-gray-200 py-9">
    <div class="container">
      <TransactionsTable :transactions="transactions"/>
    </div>
  </div>
</template>

<script>

import Header from "@/components/Header";
import TableItem from "@/components/TransactionsTableItem";
import TransactionsTable from "@/components/TransactionsTable";
import AccountPanel from "@/components/AccountPanel";

export default {
  name: 'Transactions',
  data: function () {
    return {
      transactions: [{
        type: 'Received',
        id: 'dy781263f817268553487y434132123123',
        date: '16/04/2021 13:06',
        address: 'dy781263f8176796834279887321312',
        description: 'Lorem ipsum',
        amount: 387.9270987
      },
        {
          type: 'Sent',
          id: 'dy781263f817268553487y434132123123',
          date: '16/04/2021 13:06',
          address: 'dy781263f8176796834279887321312',
          description: 'Lorem ipsum',
          amount: 387.9270987
        },
        {
          type: 'Received',
          id: 'dy781263f817268553487y434132123123',
          date: '16/04/2021 13:06',
          address: 'dy781263f8176796834279887321312',
          description: 'Lorem ipsum',
          amount: 387.9270987
        },
        {
          type: 'Received',
          id: 'dy781263f817268553487y434132123123',
          date: '16/04/2021 13:06',
          address: 'dy781263f8176796834279887321312',
          description: 'Lorem ipsum',
          amount: 387.9270987
        },
        {
          type: 'Received',
          id: 'dy781263f817268553487y434132123123',
          date: '16/04/2021 13:06',
          address: 'dy781263f8176796834279887321312',
          description: 'Lorem ipsum',
          amount: 387.9270987
        },
        {
          type: 'Sent',
          id: 'dy781263f817268553487y434132123123',
          date: '16/04/2021 13:06',
          address: 'dy781263f8176796834279887321312',
          description: 'Lorem ipsum',
          amount: 387.9270987
        },
        {
          type: 'Received',
          id: 'dy781263f817268553487y434132123123',
          date: '16/04/2021 13:06',
          address: 'dy781263f8176796834279887321312',
          description: 'Lorem ipsum',
          amount: 387.9270987
        },
        {
          type: 'Received',
          id: 'dy781263f817268553487y434132123123',
          date: '16/04/2021 13:06',
          address: 'dy781263f8176796834279887321312',
          description: 'Lorem ipsum',
          amount: 387.9270987
        },
        {
          type: 'Sent',
          id: 'dy781263f817268553487y434132123123',
          date: '16/04/2021 13:06',
          address: 'dy781263f8176796834279887321312',
          description: 'Lorem ipsum',
          amount: 387.9270987
        },
        {
          type: 'Received',
          id: 'dy781263f817268553487y434132123123',
          date: '16/04/2021 13:06',
          address: 'dy781263f8176796834279887321312',
          description: 'Lorem ipsum',
          amount: 387.9270987
        },
        {
          type: 'Received',
          id: 'dy781263f817268553487y434132123123',
          date: '16/04/2021 13:06',
          address: 'dy781263f8176796834279887321312',
          description: 'Lorem ipsum',
          amount: 387.9270987
        },
        {
          type: 'Received',
          id: 'dy781263f817268553487y434132123123',
          date: '16/04/2021 13:06',
          address: 'dy781263f8176796834279887321312',
          description: 'Lorem ipsum',
          amount: 387.9270987
        },
        {
          type: 'Received',
          id: 'dy781263f817268553487y434132123123',
          date: '16/04/2021 13:06',
          address: 'dy781263f8176796834279887321312',
          description: 'Lorem ipsum',
          amount: 387.9270987
        }]
    }
  },
  components: {
    AccountPanel,
    TransactionsTable,
    TableItem,
    Header
  },
  title() {
    return 'XE Wallet » Transactions'
  }
}
</script>
