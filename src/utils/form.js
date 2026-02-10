// Copyright (C) 2022 Edge Network Technologies Limited
// Use of this source code is governed by a GNU GPL-style license
// that can be found in the LICENSE.md file. All rights reserved.

export const truncateAddress = addr => {
  if (!addr || addr.length < 11) return addr || ''
  return `${addr.slice(0, 7)}...${addr.slice(-4)}`
}

const amountRegexp = /^[0-9]+(\.[0-9]{1,6})?$/
/**
 * Parse an input amount to a number.
 *
 * @param {string} amount Input amount
 * @returns number
 */
export const parseAmount = amount => {
  if (amount.length === 0) return 0
  if (!amountRegexp.test(amount)) return NaN
  return parseFloat(amount.replace(/,/g, ''))
}
