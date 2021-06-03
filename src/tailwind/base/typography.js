const colors = require('./colors')
const { rem, media } = require('../utils')

const baseTypography = {
  text: {
    xs: rem(10),
    sm: rem(12),
    'sm2': rem(13),
    base: rem(14),
    'base2': rem(15),
    md: rem(16),
    caption: rem(17),
    lg: rem(18),
    xl: rem(20),
    '2xl': rem(22),
    '3xl': rem(30)
  },
  icons: {
    sm: rem(16),
    normal: rem(24),
    lg: rem(32),
    '2xl': rem(70),
    '3xl': rem(80),
    '4xl': rem(90),
    '5xl': rem(100),
    '6xl': rem(115)
  },
  lineHeight: {
    DEFAULT: '1.45',
    headings: '1.2'
  },
  headingsMarginBottom: rem(20),
  verticalSpacing: rem(20)
}

const generateTypographyClasses = (source, prefix) => {
  const result = {}

  for (const key in source) {
    if (source.hasOwnProperty(key)) {
      result[`${prefix}-${key}`] = {
        fontSize: source[key]
      }
    }
  }

  return result
}

const brandTypography = ({ theme }) => ({
  base: {
    '.h1, h1': {
      fontSize: rem(28),
      lineHeight: baseTypography.lineHeight.headings,
      marginBottom: baseTypography.headingsMarginBottom,
      fontFamily: theme('fontFamily.sans'),
      fontWeight: theme('fontWeight.semibold'),
      [media(theme('screens.md'))]: {
        fontSize: rem(32)
      },
      [media(theme('screens.lg'))]: {
        fontSize: rem(40)
      }
    },
    '.h2, h2': {
      fontSize: rem(24),
      lineHeight: baseTypography.lineHeight.headings,
      marginBottom: baseTypography.headingsMarginBottom,
      fontFamily: theme('fontFamily.sans'),
      fontWeight: theme('fontWeight.normal'),
      [media(theme('screens.md'))]: {
        fontSize: rem(28)
      },
      [media(theme('screens.lg'))]: {
        fontSize: rem(30)
      }
    },
    '.h3, h3': {
      fontSize: rem(12),
      lineHeight: baseTypography.lineHeight.headings,
      marginBottom: rem(16),
      fontFamily: theme('fontFamily.sans'),
      fontWeight: theme('fontWeight.normal'),
      textTransform: 'uppercase',
      letterSpacing: '2.4px'
    },
    'a:not([class])': {
      color: colors.black.DEFAULT,
      textDecoration: 'none',
      transitionProperty: theme('transitionProperty.colors'),
      transitionTimingFunction: theme('transitionTimingFunction.in'),
      transitionDuration: theme('transitionDuration.200'),
      '&:hover': {
        color: colors.black.DEFAULT
      }
    },
    '.link-underline': {
      color: 'currentColor',
      textDecoration: 'underline',
      '&:hover': {
        textDecoration: 'none'
      }
    },
    'ol:not([class])': {
      counterReset: 'ol-num-counter',
      marginBottom: baseTypography.verticalSpacing,
      li: {
        paddingLeft: rem(28),
        position: 'relative',
        marginBottom: rem(16),
        counterIncrement: 'ol-num-counter',
        '&:before': {
          content: 'counter(ol-num-counter)',
          position: 'absolute',
          fontWeight: theme('fontWeight.bold'),
          color: 'currentColor',
          width: rem(24),
          left: 0,
          textAlign: 'center'
        },
        '&:last-child': {
          marginBottom: 0
        }
      },
      'ol, ul': {
        paddingLeft: rem(20),
        marginBottom: rem(16)
      },
      '> ol': {
        counterReset: 'ol-letter-counter',
        '> li': {
          counterIncrement: 'ol-letter-counter',
          '&:before': {
            content: 'counter(ol-letter-counter,  lower-latin)"."'
          }
        },

        '> ol': {
          counterReset: 'ol-num-counter',
          '> li': {
            counterIncrement: 'ol-num-counter',
            '&:before': {
              content: 'counter(ol-num-counter)'
            }
          }
        }
      }
    },
    'ul:not([class])': {
      marginBottom: baseTypography.verticalSpacing,
      li: {
        paddingLeft: rem(28),
        position: 'relative',
        marginBottom: rem(16),
        '&:before': {
          content: '"•"',
          position: 'absolute',
          fontWeight: theme('fontWeight.bold'),
          color: 'currentColor',
          width: rem(24),
          left: 0,
          textAlign: 'center'
        },
        '&:last-child': {
          marginBottom: 0
        }
      },
      'ol, ul': {
        paddingLeft: rem(20),
        marginBottom: rem(16)
      },
      '> ul': {
        '> li': {
          '&:before': {
            content: '"-"'
          }
        },

        '> ul': {
          '> li': {
            '&:before': {
              content: '"•"'
            }
          }
        }
      }
    }
  },
  responsive: {
    ...generateTypographyClasses(baseTypography.text, '.text'),
    ...generateTypographyClasses(baseTypography.icons, '.icon')
  }
})

module.exports = { baseTypography, brandTypography }
