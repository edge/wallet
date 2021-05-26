const {
  xeStringFromMicroXe
} = require('@edge/wallet-utils')

const BLOCKCHAIN_API_URL = process.env.VUE_APP_BLOCKCHAIN_API_URL
const INDEX_API_URL = process.env.VUE_APP_INDEX_API_URL

const fetchData = url => {
  return fetch(url, {
    method: 'get',
    headers: {
      'content-type': 'application/json'
    }
  })
    .then(res => {
      console.log('res', res)
      // a non-200 response code
      if (!res.ok) {
        // create error instance with HTTP status text
        const error = new Error(res.statusText)
        error.json = res.json()
        throw error
      }

      return res.json()
    })
    .catch(err => {
      console.log(err)

      // if (err.json) {
      // return err.json.then(json => {
      // set the JSON response message
      // this.error.message = json.message
      // })
      // }
      return {
        results: [],
        metdata: {}
      }
    })
}

const fetchTransactions = async (address, options = {}) => {
  if (!options.page) {
    options.page = 1
  }

  if (!options.limit) {
    options.limit = 25
  }

  const url = `${INDEX_API_URL}/transactions/${address}` // ?page=${options.page}&limit=${options.limit}

  return fetchData(url)
    .then(({ results, metadata }) => {
      const transactions = results.map(tx => {
        return {
          address: tx.sender === address ? tx.recipient : tx.sender,
          amount: xeStringFromMicroXe(tx.amount),
          description: tx.data.memo || 'None',
          id: tx.hash,
          date: new Date(tx.timestamp).toLocaleString(), // '16/04/2021 13:06',
          timestamp: tx.timestamp,
          type: tx.sender === address ? 'Sent' : 'Received'
        }
      })

      return {
        transactions,
        metadata
      }
    })
}

const fetchWallet = address => {
  return fetchData(`${BLOCKCHAIN_API_URL}/wallet/${address}`)
}

export {
  fetchTransactions,
  fetchWallet
}
