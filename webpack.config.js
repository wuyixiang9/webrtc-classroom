var path = require('path');
var webpack = require('webpack');
var HtmlWebpackPlugin = require('html-webpack-plugin');

var webpackConfig = {
  devtool: 'inline-source-map',
  entry: {
    'vendor': ['./src/vendor.ts'],
    'main': './src/main.ts'
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'assets')
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        use: 'awesome-typescript-loader',
        exclude: /node_modules/
      },
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
      name: ['main', 'vendor'],
      filename: 'assets/[name].js'
    }),
    new HtmlWebpackPlugin({
      // chunks: ['vendors', 'assets/main'],
      filename: 'views/index.html',
      template: path.join(__dirname, './src/views/index.html')
    }),
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
    })
  ]
}
if (process.env.NODE_ENV === 'development') {
  // webpackConfig.entry.vendor.push('webpack-hot-middleware/client')
  // webpackConfig.plugins.push(new webpack.HotModuleReplacementPlugin())
}
if (process.env.NODE_ENV === 'production') {
  webpackConfig.output.path = path.resolve(__dirname, '.')
  webpackConfig.plugins.push(
    new webpack.optimize.UglifyJsPlugin({
      comments: false,
      sourceMap: true,
      compress: true
    })
  )
}
module.exports = webpackConfig