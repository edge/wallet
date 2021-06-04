const {
  xeStringFromMicroXe
} = require('@edge/wallet-utils')

const BLOCKCHAIN_API_URL = process.env.VUE_APP_BLOCKCHAIN_API_URL
const INDEX_API_URL = process.env.VUE_APP_INDEX_API_URL

const fetchData = (url, options = {}, payload) => {
  const fetchOptions = {
    method: options.method || 'get',
    headers: {
      'content-type': 'application/json'
    }
  }

  if (payload) {
    fetchOptions.body = JSON.stringify(payload, true, 2)
  }

  return fetch(url, fetchOptions)
    .then(res => {
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

const fetchBlocks = async (options = {}) => {
  if (!options.page) {
    options.page = 1
  }

  if (!options.limit) {
    options.limit = 10
  }

  const url = `${INDEX_API_URL}/blocks?page=${options.page}&limit=${options.limit}`

  return fetchData(url)
    .then(response => {
      const { results, metadata } = response
      return {
        blocks: results,
        metadata
      }
    })
}

const fetchPendingTransactions = (address, options = {}) => {
  const url = `${BLOCKCHAIN_API_URL}/transactions/pending/${address}`

  return fetchData(url)
}

const fetchTransactions = async (address, options = {}) => {
  if (!options.page) {
    options.page = 1
  }

  if (!options.limit) {
    options.limit = 25
  }

  const pendingTxUrl = `${BLOCKCHAIN_API_URL}/transactions/pending/${address}`
  const txUrl = `${INDEX_API_URL}/transactions/${address}?page=${options.page}&limit=${options.limit}`

  let txResults = []

  // Fetch pending transactions first.
  return fetchData(pendingTxUrl)
    .then(response => {
      // Pending transactions need to be reversed to show them in the correct order.
      response = response.reverse()
      txResults = txResults.concat(formatTransactions(address, response, true))

      // Fetch confirmed transactions.
      return fetchData(txUrl)
        .then(response => {
          const { results, metadata } = response
          txResults = txResults.concat(formatTransactions(address, results))

          return {
            transactions: txResults,
            metadata
          }
        })
    })
}

const fetchWallet = address => {
  return fetchData(`${BLOCKCHAIN_API_URL}/wallet/${address}`)
}

const formatTransactions = (address, data, pending) => {
  return data.map(tx => {
    return {
      address: tx.sender === address ? tx.recipient : tx.sender,
      amount: xeStringFromMicroXe(tx.amount),
      date: new Date(tx.timestamp).toLocaleString(), // '16/04/2021 13:06',
      description: tx.data.memo || 'None',
      hash: tx.hash,
      recipient: tx.recipient,
      sender: tx.sender,
      timestamp: tx.timestamp,
      type: tx.sender === address ? 'Sent' : 'Received',
      confirmations: tx.confirmations,
      pending
    }
  })
}

const sendTransaction = tx => {
  return fetchData(`${BLOCKCHAIN_API_URL}/transaction`, { method: 'post' }, tx)
}

export {
  fetchBlocks,
  fetchPendingTransactions,
  fetchTransactions,
  fetchWallet,
  formatTransactions,
  sendTransaction
}
