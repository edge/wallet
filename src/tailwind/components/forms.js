const { rem } = require('../utils');
const colors = require('../base/colors');
const { baseTypography: typography } = require('../base/typography');

const formStyles = ({ theme }) => ({
    base: {
      width: '100%',
      height: '57px',
      padding: `${rem(3)} ${rem(15)}`,
      margin: '0',
      backgroundColor: colors.black.DEFAULT,
      borderWidth: 0,
      color: colors.gray[200],
      lineHeight: 'normal',
      borderRadius: rem(4),
      fontSize: typography.text.base,
      '&:focus, &:focus-visible': {
        outline: 'none',
      },
    },
    formGroup: {
      position: 'relative',
      marginBottom: rem(40),
      width: '100%',

      '.input-wrap input:not([type=submit]):not([type=range])': {
        paddingLeft: rem(52),
      },

      '.icon': {
        position: 'absolute',
        left: rem(14),
        top: '50%',
        transform: 'translateY(-50%)',
        width: rem(24),
        color: colors.gray.DEFAULT
      }
    },
    label: {
      marginBottom: rem(13),
      textTransform: 'uppercase',
      color: colors.gray.DEFAULT,
      display: 'block',
      fontSize: typography.text.sm,
      letterSpacing: rem(3)
    }
});

const forms = ({ theme }) => {
    const {base, formGroup, label} = formStyles({ theme });
    return {
        ['input:not([type=submit]):not([type=range]):not([type="number"])']: base,
        ['.form-group']: formGroup,
        ['.label, label']: label,
    };
};

module.exports = { forms };
