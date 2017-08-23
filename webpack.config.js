const ExtractTextPlugin = require("extract-text-webpack-plugin"),
      HtmlWebpackPlugin = require("html-webpack-plugin"),
      HtmlWebpackPluginConfig = new HtmlWebpackPlugin({
        template: __dirname + "/client/index.html",
        filename: "index.html",
        inject: "body"
      })
module.exports = {
  entry: [
    "babel-polyfill",
    "./client/index.js"
  ],
  output: {
    path: __dirname + "/public",
    filename: "build.js"
  },
  module: {
    loaders: [
      {
        test: /\.js$/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.jsx$/,
        loader: "babel-loader",
        exclude: /node_modules/
      },
      {
        test: /\.(png|jpg)$/,
        loader: "file-loader"
      },
      {
        test: /\.css$/,
        loader: ExtractTextPlugin.extract({
          fallback: "style-loader",
          use: "css-loader?minimize=true"
        })
      }
    ]
  },
  plugins: [
    HtmlWebpackPluginConfig,
    new ExtractTextPlugin("build.css")
  ]
}