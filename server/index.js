// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

const config = require('./config')
const express = require('express')
const morgan = require('morgan')
const path = require('path')
const fs = require('fs')

// Create & configure express app
const app = new express()
const www = path.join(__dirname, '..', 'dist')
const html = fs.readFileSync(`${www}/index.html`, 'utf8')

// Middleware
app.use(morgan('dev'))
app.use('/', express.static(www))

// Return the index page everything
app.use((req, res) => {
  res.send(html)
})

// Listen on the configured port
app.listen(config.http.port, () => {
  console.log(`Edge Wallet listening for requests on ${config.http.port}`)
})
