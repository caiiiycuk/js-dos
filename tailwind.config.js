module.exports = {
    purge: [
        "src/**/*.ts",
    ],
    darkMode: false,
    theme: {
        extend: {
            animation: {
                "reverse-spin": "reverse-spin 1s linear infinite",
            },
            keyframes: {
                "reverse-spin": {
                    from: {
                        transform: "rotate(360deg)",
                    },
                },
            },
        },
    },
    variants: {
        extend: {},
    },
    plugins: [],
};
