// Copyright (C) 2021 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

require('dotenv').config()

module.exports = {
  http: {
    port: process.env.HTTP_PORT ? parseInt(process.env.HTTP_PORT) : 8000
  }
}
