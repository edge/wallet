import { helpers, minLength, required as _required } from '@vuelidate/validators'

/**
 * XE amount validation rules.
 *
 * These rules do not automatically parse the raw value.
 * Parsing should be handled in the component, returning NaN if the raw value contains invalid characters.
 * To validate correctly against current balance, reactive properties must be provided, per:
 * https://vuelidate-next.netlify.app/custom_validators.html#passing-extra-reactive-properties
 *
 * An example of usage can be found in SendModal.vue.
 *
 * @param {number} b Balance (reactive)
 * @param {number} p Parsed amount (reactive)
 * @returns ValidationRuleWithParams[]
 */
export const amount = (b, p) => [
  helpers.withParams({ p }, helpers.withMessage('Invalid amount.', () => !isNaN(p) && p > 0)),
  helpers.withParams({ b, p }, helpers.withMessage('Insufficient funds.', () => {
    if (isNaN(p)) return false
    return p <= (b / 1e6)
  }))
]

/**
 * Create a validation function for case insensitive comparison, similar to Vuelidate's `sameAs` function.
 *
 * If a `msg` argument is provided, it will be set as the error message if the validation fails.
 *
 * @param {string} cmp Comparison string. Will be converted to lowercase automatically
 * @param {string} msg Optional message
 * @returns Function
 */
export const caseInsensitive = (cmp, msg = '') => {
  const lcmp = cmp.toLowerCase()
  const validate = val => val.toLowerCase() === lcmp
  if (msg.length) return helpers.withMessage(msg, validate)
  return validate
}

/**
 * Password validation rules.
 */
export const password = [
  helpers.withMessage('Password required.', _required),
  helpers.withMessage('Must be 10 characters or more.', minLength(10)),
]

export const required = helpers.withMessage('A value is required.', _required)
