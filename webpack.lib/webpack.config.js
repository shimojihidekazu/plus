const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {
    main: path.join(__dirname, 'src', 'main.js')
  },
  mode: 'production',
  //mode: 'development',
  output: {
    path: path.join(__dirname, '../html/assets/', 'dist'),
    filename: '[name]_[hash].js'
  },
  devtool: false,
  performance: { hints: false },
  module: {
    rules: [{
      test: /\.css$/,
      use: [
        "style-loader",
        "css-loader"
      ]
    }],
  }
};