"use strict";

const webpack      = require("webpack");
const webpack_copy = require('copy-webpack-plugin');

const path         = require("path");


const include_path = path.resolve(__dirname, "src");
const output_path  = path.resolve(__dirname, "dist");

module.exports = {
    // Entry points output to their name as a path within dist.
    entry: {
        "popup/bundle": `${include_path}/popup/index.jsx`
      , "options/bundle": `${include_path}/options/index.jsx`
    }
  , output: {
        filename: "[name].js"
      , path: `${output_path}`
    }
  , plugins: [
        // Reduce size
        new webpack.optimize.UglifyJsPlugin()
        // Share common code between bundles
      , new webpack.optimize.CommonsChunkPlugin("lib/init.bundle")
      , new webpack.DefinePlugin({
            "process.env.NODE_ENV": `"production"`
        })
        // Copy other files to dist directory
      , new webpack_copy(
            [{ from: include_path }]
          , { ignore: [ "*.jsx" ]})
    ]
  , devtool: "inline-source-map"
  , module: {
        loaders: [
            {
                test: /\.jsx?/
              , include: include_path
              , loader: "babel-loader"
              , options: {
                    presets: [ "react" ]
                  , plugins: [
                        "transform-decorators-legacy"
                      , "transform-class-properties"
                      , "transform-do-expressions"
                      , "transform-object-rest-spread"
                    ]
                }
            }
        ]
    }
  , resolve: {
        //alias: {
        //    "react": "preact-compat"
        //  , "react-dom": "preact-compat"
        //}
        extensions: [ ".js", ".jsx" ]
    }
};
