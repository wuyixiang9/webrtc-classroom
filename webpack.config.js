var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
  entry: {
    'assets/study': './src/study.js',
    'assets/teach': './src/teach.js'
  },
  output: {
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: [
          { loader: "style-loader" },
          { loader: "css-loader" }
        ]
      }
    ]
  },
  plugins: [
    new webpack.optimize.CommonsChunkPlugin({
      name: 'commons',
      children: true,
      minChunks: 2
    }),
    new HtmlWebpackPlugin({
      chunks: ['commons', 'assets/study'],
      filename: 'views/study.html',
      template: './src/views/study.html'
    }),
    new HtmlWebpackPlugin({
      chunks: ['commons', 'assets/teach'],
      filename: 'views/teach.html',
      template: './src/views/teach.html'
    }),
  ]
}