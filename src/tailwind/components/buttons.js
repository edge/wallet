const { rem } = require('../utils')

const colors = require('../base/colors')
const { baseTypography: typography } = require('../base/typography')
const themes = {
  solid: {
    backgroundColor: colors.black.DEFAULT,
    color: colors.white,

    '&:hover, &.hover': {
      backgroundColor: colors.black.DEFAULT,
      borderColor: colors.black.DEFAULT,
      color: colors.white
    },

    '&:disabled, &.disabled': {
      backgroundColor: colors.black[100],
      borderColor: colors.black[100]
    }
  },
  outline: {
    color: colors.black.DEFAULT,

    '&:hover, &.hover': {
      borderColor: colors.black.DEFAULT,
      color: colors.black.DEFAULT
    },

    '&:disabled, &.disabled': {
      borderColor: colors.black[100],
      color: colors.black[200]
    }
  },
  error: {
    backgroundColor: colors.black.DEFAULT,
    borderColor: colors.black.DEFAULT,
    color: colors.white,

    '&:hover, &.hover': {
      backgroundColor: 'transparent',
      color: colors.black.DEFAULT
    },

    '&:disabled, &.disabled': {
      backgroundColor: colors.black[100],
      borderColor: colors.black[100]
    }
  },
  success: {
    backgroundColor: colors.green[200],
    borderColor: colors.green[200],
    color: colors.white,

    '&:hover, &.hover': {
      backgroundColor: colors.green[300],
      color: colors.white
    },

    '&:disabled, &.disabled': {
      backgroundColor: colors.green.DEFAULT,
      borderColor: colors.green.DEFAULT
    }
  },
  'outline-success': {
    borderColor: colors.green[200],
    color: colors.white,

    '&:hover, &.hover': {
      borderColor: colors.green[200],
      backgroundColor: colors.green[200]
    },

    '&:disabled, &.disabled': {
      borderColor: colors.green
    }
  }
}

const themeButtonStyles = () => {
  const styles = {}

  for (const theme in themes) {
    if (themes.hasOwnProperty(theme)) {
      styles[theme] = themes[theme]
    }
  }

  return styles
}

const buttonsStyles = ({ theme }) => ({
  base: {
    lineHeight: 1.2,
    display: 'inline-flex',
    alignItems: 'center',
    cursor: 'pointer',
    justifyContent: 'center',
    position: 'relative',
    fontWeight: theme('fontWeight.bold'),
    transitionProperty: theme('transitionProperty.default'),
    transitionTimingFunction: theme("transitionTimingFunction['in-out']"),
    transitionDuration: theme('transitionDuration.200'),
    padding: `${rem(12)} ${rem(25)} ${rem(13)} ${rem(25)}`,
    fontSize: typography.text.base,
    appearance: 'none',
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: colors.black.DEFAULT,
    borderRadius: rem(4),
    color: colors.white,

    '&:disabled, &.disabled': {
      color: colors.black[200],
      pointerEvents: 'none'
    },

    '&:focus': {
      outline: 'none'
    },

    '.button__icon': {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      left: rem(8)
    }
  },
  ...themeButtonStyles()
})

const buttons = ({ theme }) => {
  const button = buttonsStyles({ theme })
  return {
    '.button': button.base,
    '.button--solid': button.solid,
    '.button--outline': button.outline,
    '.button--error': button.error,
    '.button--success': button.success,
    '.button--outline-success': button['outline-success']
  }
}

module.exports = { buttons, buttonsStyles }
