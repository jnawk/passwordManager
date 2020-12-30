var webpack = require('webpack');
var path = require('path');

var BUILD_DIR = path.resolve(__dirname, 's3');
var APP_DIR = path.resolve(__dirname, 'js');

var config = {
  devtool: 'source-map',
  entry: APP_DIR + '/index.jsx',
  output: {
    path: BUILD_DIR,
    filename: 'passwordManager.js'
  },
  mode: 'development',
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        include: APP_DIR,
        use: 'babel-loader'
      },
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.eot(\?v=\d+\.\d+\.\d+)?$/,
        use: "file-loader"
      },
      {
        test: /\.txt$/,
        loader: "raw-loader",
        options: {
          esModule: false
        }
      },
      {
        test: /\.(woff|woff2)$/,
        use :"url-loader?prefix=font/&limit=5000"
      },
      {
        test: /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
        use: "url-loader?limit=10000&mimetype=application/octet-stream"
      },
      {
        test: /\.svg(\?v=\d+\.\d+\.\d+)?$/,
        use: "url-loader?limit=10000&mimetype=image/svg+xml"
      }
    ]
  }
};

module.exports = config;
