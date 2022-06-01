module.exports = {
    purge: {
        content: ["src/**/*.ts"],
        safelist: [
            "opacity-0",
            "opacity-80",
        ],
    },
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
