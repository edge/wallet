// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

const {
  xeStringFromMicroXe
} = require('@edge/wallet-utils')

const BLOCKCHAIN_API_URL = process.env.VUE_APP_BLOCKCHAIN_API_URL
const INDEX_API_URL = process.env.VUE_APP_INDEX_API_URL

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
      return {
        results: [],
        metdata: {}
      }
    })
}

const fetchPendingTransactions = (address, options = {}) => {
  const url = `${BLOCKCHAIN_API_URL}/transactions/pending/${address}`

  return fetchData(url)
}

const fetchGasRates = async () => {
  return fetchData(`${INDEX_API_URL}/gasrates`)
}

const fetchExchangeRates = async () => {
  return await fetchData(`${INDEX_API_URL}/exchangerate`)
}

const fetchTransactions = async (address, options = {}) => {
  if (!options.page) {
    options.page = 1
  }

  if (!options.limit) {
    options.limit = 20
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

const formatTransactions = (address, data, pending) => {
  const transactions = []

  data.forEach(tx => {
    if (tx.sender === tx.recipient) {
      const rcvTx = {
        address: tx.sender === address ? tx.recipient : tx.sender,
        amount: xeStringFromMicroXe(tx.amount),
        date: new Date(tx.timestamp).toLocaleString(), // '16/04/2021 13:06',
        description: tx.data.memo || 'None',
        hash: tx.hash,
        recipient: tx.recipient,
        sender: tx.sender,
        timestamp: tx.timestamp,
        type: 'Received',
        confirmations: tx.confirmations,
        pending
      }

      const sendTx = {
        ...rcvTx,
        type: 'Sent'
      }

      transactions.push(rcvTx)
      transactions.push(sendTx)
    } else {
    transactions.push({
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
    })
    }
  })

  return transactions
}

export {
  fetchBlocks,
  fetchPendingTransactions,
  fetchGasRates,
  fetchExchangeRates,
  fetchTransactions,
  formatTransactions,
}
