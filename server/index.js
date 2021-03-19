//                  $$\
//                  $$ |
//   $$$$$$\   $$$$$$$ | $$$$$$\   $$$$$$\
//  $$  __$$\ $$  __$$ |$$  __$$\ $$  __$$\
//  $$$$$$$$ |$$ /  $$ |$$ /  $$ |$$$$$$$$ |
//  $$   ____|$$ |  $$ |$$ |  $$ |$$   ____|
//  \$$$$$$$\ \$$$$$$$ |\$$$$$$$ |\$$$$$$$\
//   \_______| \_______| \____$$ | \_______|
//                      $$\   $$ |
// © 2021 Edge Network  \$$$$$$  |
//   Technologies Ltd.   \______/

const debug = require('debug')('edge:wallet')
const express = require('express')
const config = require('./config')

const app = new express()

app.use('/', (req, res, next) => {
  res.status(200)
     .type('txt')
     .send('edge wallet')
})

app.use((req, res, next) => {
  res.status(404)
     .type('txt')
     .send(`Not Found`)
})

app.listen(config.http.port, () => {
  console.log(`Edge Wallet listening on port ${config.http.port}`)
})
