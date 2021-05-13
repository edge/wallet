const { rem } = require('../utils');
const { baseTypography: typography } = require('./typography');

const styles = ({ theme }) => ({
    p: {
        marginBottom: typography.verticalSpacing,
    },

    body: {
        fontSize: rem(14),
        lineHeight: theme('lineHeight.normal'),
    },
});

module.exports = { styles };
