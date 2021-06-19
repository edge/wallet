const { rem } = require('../utils')

const containerStyles = ({ theme }) => ({
  base: {
    maxWidth: 1280,
    paddingRight: rem(15),
    paddingLeft: rem(15),
    marginRight: 'auto',
    marginLeft: 'auto',
    width: '100%'
  }
})

const container = ({ theme }) => {
  const {base} = containerStyles({ theme })
  return {
    '.container': base
  }
}

module.exports = { container }
