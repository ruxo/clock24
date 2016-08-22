var path = require("path")  
var webpack = require("webpack")

module.exports = {  
  devtool: "source-map",
  entry: "./out/clock.js",
  output: {
    path: path.join(__dirname, "out"),
    publicPath: "/out/",
    filename: "bundle.js"
  },
  module: {
    preLoaders: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: "source-map-loader"
      }
    ]
  }
}