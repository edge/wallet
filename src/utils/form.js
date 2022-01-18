const amountRegexp = /^[0-9,.]+$/
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
