const plugin = require('tailwindcss/plugin');
const _ = require('lodash');
const { round } = require('./utils');

const colors = require('./base/colors');
const { spacing } = require('./base/spacing');
const { styles } = require('./base/styles');
const { brandTypography } = require('./base/typography');
const { rem } = require('./utils')

const {
    buttons,
    container,
    transactionTable,
} = require('./components');

// const { input, checkbox, radio, formSwitch, select, picker } = require('./components/forms');

const addNewComponents = ({ components, ...rest }) => {
    if (components.length === 0) {
        return;
    }

    components.forEach(({ source, variant = null }) => {
        return Object.entries(source).map(([className, values]) => {
            const override = rest.brandOverrides[className] || {};

            rest.addComponents({ [className]: _.merge(values, override) }, rest.variants(variant));
        });
    });
};

module.exports = plugin.withOptions(
    () => {
        return function ({ addBase, addComponents, theme, variants }) {
            const brandOverrides = theme('brand', {});

            addBase(styles({ theme }));

            addNewComponents({
                components: [
                    { source: brandTypography({ theme }).base },
                    { source: brandTypography({ theme }).responsive, variant: 'brandTypography' },
                    { source: container({theme})},
                    { source: buttons({ theme }) },
                    { source: transactionTable({ theme }) },
                ],
                brandOverrides,
                addComponents,
                variants,
            });
        };
    },
    (options = {}) => {
        return {
            theme: {
                purge: ['./src/**/*.html', './src/**/*.vue', './public/**/*.html'],
                extend: {
                    colors: colors,
                    fontFamily: {
                        sans: 'Inter, system-ui, -apple-system, Arial, Noto Sans'
                    },
                    lineHeight: {
                        normal: round(20 / 14),
                    },
                    spacing: spacing,
                    borderRadius: {
                        4: rem(4),
                        xl: '1rem',
                        '2xl': '1.25rem',
                    },
                    minWidth: {
                        100: rem(100)
                    },
                    borderWidth: {
                        default: '1px',
                    },
                    inset: {
                        100: '100%',
                    },
                    maxWidth: {
                        md: '25.25rem',
                        xl: '52rem',
                        '2xl': '54rem',
                        '3xl': '57rem',
                        '4xl': '60rem',
                        '5xl': '64rem',
                        '6xl': '72rem',
                        '560': rem(560),
                        '800': rem(800),
                    },
                    fontSize: {
                      half: '50%'
                    },
                    container: {
                        padding: {
                            DEFAULT: spacing[15],
                        },
                    },
                },
            },
            variants: {
                brandTypography: ['responsive'],
                translate: ['responsive', 'hover', 'focus', 'group-hover'],
            }
        };
    }
);
