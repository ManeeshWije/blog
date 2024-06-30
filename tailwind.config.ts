/** @type {import('tailwindcss').Config} */
module.exports = {
    content: ["./src/views/index.hbs", "./public/*.{html,js,hbs}", "./src/views/partials/*.{html,js,hbs}"],
    theme: {
        extend: {},
    },
    plugins: [],
    corePlugins: {
        preflight: false,
    },
};
