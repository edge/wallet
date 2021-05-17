const {rem} = require('../utils');
const colors = require('../base/colors');
const {baseTypography: typography} = require('../base/typography');

const formStyles = ({theme}) => ({
    base: {
        width: '100%',
        height: '57px',
        padding: `${rem(3)} ${rem(15)}`,
        margin: '0',
        backgroundColor: colors.black.DEFAULT,
        borderWidth: 1,
        borderColor: colors.black.DEFAULT,
        color: colors.gray[200],
        lineHeight: 'normal',
        borderRadius: rem(4),
        fontSize: typography.text.base,
        '&:focus, &:focus-visible': {
            outline: 'none',
        },
        '.form-group__error &': {
            borderColor: colors.green.DEFAULT,
            color: colors.green.DEFAULT
        }
    },
    formGroup: {
        position: 'relative',
        marginBottom: rem(42),
        width: '100%',

      '.input-wrap input:not([type=submit]):not([type=range]):not([type=radio]):not([type=checkbox])': {
        paddingLeft: rem(52),
      },

        '.icon': {
            position: 'absolute',
            left: rem(14),
            top: '50%',
            transform: 'translateY(-50%)',
            width: rem(24),
            color: colors.gray.DEFAULT
        },

        '.form-group__error': {
            color: colors.green.DEFAULT,
            marginTop: rem(3)
        }
    },
    whiteFormGroup: {
      position: 'relative',

      '.input-wrap input:not([type=submit]):not([type=range]):not([type=radio]):not([type=checkbox])': {
        backgroundColor: 'transparent',
        fontSize: typography.text['3xl'],
        color: colors.white,
        paddingLeft: 0,
        paddingRight: rem(73),
        height: '61px',
        borderRadius: 0,
        borderBottom: '1px solid #fff'
      },

      'label': {
        marginBottom: 0
      }
    },
    label: {
        marginBottom: rem(10),
        textTransform: 'uppercase',
        color: colors.gray.DEFAULT,
        display: 'block',
        fontSize: typography.text.sm,
        letterSpacing: rem(2.4),
        '.form-group__error &': {
            color: colors.green.DEFAULT
        }
    }
});

const forms = ({ theme }) => {
    const {base, formGroup, whiteFormGroup, label} = formStyles({ theme });
    return {
        ['.input-wrap input:not([type=submit]):not([type=range]):not([type=radio]):not([type=checkbox])']: base,
        ['.form-group']: formGroup,
        ['.lg-input-group']: whiteFormGroup,
        ['.label, label']: label,
    };
};

module.exports = {forms};
