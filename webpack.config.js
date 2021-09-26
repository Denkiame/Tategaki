const path = require('path')

module.exports = {
    mode: "development", // production, development
    devtool: "inline-source-map",
    entry: "./src/external.ts",
    output: {
        filename: "bundle.js",
        path: path.resolve(__dirname, 'assets/scripts')
    },
    resolve: { extensions: [".ts", ".js"] },
    module: {
        rules: [
            { test: /\.ts/, use: "ts-loader", exclude: /node_modules/ }
        ]
    },
    devServer: {
        static: "./assets",
        port: 7473
    }
}
