const defaultTheme = require('tailwindcss/defaultTheme')
module.exports = {
    purge: [],
    darkMode: false,
    theme: {
        extend: {
        },
    },
    variants: {
        extend: {},
    },
    corePlugins: {
        container: false
    },
    plugins: [
     require('./src/tailwind')
    ],
}