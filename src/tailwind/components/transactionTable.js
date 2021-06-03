const { rem } = require('../utils')

const transactionTableStyles = ({ theme }) => ({
  base: {
    'table': {
      width: '100%'
    },
    'thead': {
      'th': {
        padding: `${rem(13)} ${rem(5)}`,
        '&:first-of-type': {
          paddingLeft: rem(20)
        },
        '&:last-of-type': {
          paddingRight: rem(30)
        }
      }
    }
  }
})

const transactionTable = ({ theme }) => {
  const {base} = transactionTableStyles({ theme })
  return {
    '.transaction-table': base
  }
}

module.exports = { transactionTable }
