
module.exports = {
    entry: "./src/index.ts",
    output: {
        filename: "bundle.js",
        path: __dirname + "/dist"
    },
    devtool: "source-map",
    resolve: {
        alias: {
            jquery: "jquery/src/jquery"
        },
        extensions: [".ts", ".tsx", ".js", ".json"]
    },
    module: {
        rules: [
            { test: /\.ts?$/, loader: "awesome-typescript-loader" },
            { enforce: "pre", test: /\.js$/, loader: "source-map-loader" }
        ]
    }


    // When importing a module whose path matches one of the following, just
    // assume a corresponding global variable exists and use that instead.
    // This is important because it allows us to avoid bundling all of our
    // dependencies, which allows browsers to cache those libraries between builds.


};

