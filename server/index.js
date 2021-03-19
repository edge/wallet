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

const config = require('./config')
const express = require('express')
const morgan = require('morgan')
const path = require('path')
const flat = require('flat')
const fs = require('fs')

// Create & configure express app
const app = new express()
app.use(morgan('dev'))
app.use(express.static(path.join(__dirname, '../www/public')))

// Load template data
const data = {
  title: config.website.title,
  templates: loadTemplates()
}

// Reload templates for every request when
// not running in production!
if (process.env.NODE_ENV != 'production') {
  app.use((req, res, next) => {
    data.templates = loadTemplates()
    next()
  })
}

// Handle the index page
app.get('/', (req, res, next) => {
  const pageData = { ...data }
  res.send(render(data.templates.index, pageData))
})

// Catch all other requests and send the error page
app.use((req, res, next) => {
  const pageData = {
    ...data,
    title: `${data.title} | Not Found`,
    errorCode: 404,
    errorMessage: 'Not Found'
  }

  res.send(render(data.templates.error, pageData))
})

// Listen on the configured port
app.listen(config.http.port, () =>
  console.log(`Edge Wallet listening for requests on ${config.http.port}`))

// Basic recursive view renderer
function render(template, data) {
  const flatData = flat(data)
  return typeof template != 'string'
    ? template
    : template.replace(
      /({% ?([a-zA-Z0-9._]+) ?%})/g,
      (match, p1, p2, offset, string) => {
        return render(flatData[p2], data) || ''
      }
  )
}

// Load template content
function loadTemplates() {
  const www = path.join(__dirname, '..', 'www')
  return {
    _header: fs.readFileSync(`${www}/partials/_header.html`, 'utf8'),
    _footer: fs.readFileSync(`${www}/partials/_footer.html`, 'utf8'),
    index: fs.readFileSync(`${www}/index.html`, 'utf8'),
    error: fs.readFileSync(`${www}/error.html`, 'utf8')
  }
}
