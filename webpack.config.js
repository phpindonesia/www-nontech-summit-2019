const webpack = require('webpack')
const path = require('path')
const UglifyJsPlugin = require('uglifyjs-webpack-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const MiniCssExtractPlugin = require("mini-css-extract-plugin")
const CompressionPlugin = require("compression-webpack-plugin")
const OptimizeCSSAssetsPlugin = require("optimize-css-assets-webpack-plugin")
const CopyWebpackPlugin = require('copy-webpack-plugin')
const { InjectManifest } = require('workbox-webpack-plugin')

const SRC = path.resolve(__dirname, 'src');
const NODE_ENV = process.env.NODE_ENV;

const isDev = () => {
  return (NODE_ENV === 'development');
};

const setPublicPath = () => {
  return '/';
};

const setPath = function(folderName) {
  return path.join(__dirname, folderName);
};

const extractHTML = (filename, templatePath) => {
  return new HtmlWebpackPlugin({
    title: 'HTML',
    filename: filename,
    inject: true,
    template: setPath(templatePath),
    minify: {
      removeAttributeQuotes: true,
      collapseWhitespace: true,
      html5: true,
      minifyCSS: true,
      removeComments: true,
      removeEmptyAttributes: true
    },
    environment: process.env.NODE_ENV
  });
}

let plugins = [
  new webpack.DefinePlugin({
    'process.env': {
      isStaging: (isDev() || NODE_ENV === 'staging'),
      NODE_ENV: '"'+NODE_ENV+'"'
    }
  }),
  extractHTML('index.html', 'src/index.ejs'),
  extractHTML('contact/index.html', 'src/contact/index.ejs'),
  extractHTML('faq/index.html', 'src/faq/index.ejs'),
  extractHTML('location/index.html', 'src/location/index.ejs'),
  extractHTML('register/index.html', 'src/register/index.ejs'),
  extractHTML('speaker/index.html', 'src/speaker/index.ejs'),
  extractHTML('sponsor/index.html', 'src/sponsor/index.ejs'),
  extractHTML('volunteer/index.html', 'src/volunteer/index.ejs'),
];

if (!isDev()) {
  plugins = [].concat(plugins)
  .concat([
    new MiniCssExtractPlugin({
      filename: "[name].[hash].css"
    }),
    new CompressionPlugin({
      algorithm: 'gzip'
    }),
    new InjectManifest({
      swSrc: './src/sw.js',
    }),
    new CopyWebpackPlugin([
      'manifest.json',
      'images/**',
    ]),
  ])
}

module.exports = {
  entry: {
    app: './src/index.js'
  },
  output: {
    path: isDev() ? path.resolve(__dirname) : setPath('dist'),
    publicPath: setPublicPath(),
    filename: isDev() ? '[name].js' : '[name].[hash].js'
  },
  mode: isDev() ? 'development' : 'production',
  optimization:{
    runtimeChunk: false,
    splitChunks: {
      chunks: "all",
    },
    // minimize: !isDev(),
    // minimizer: isDev() ? [
    //   new UglifyJsPlugin(),
    //   new OptimizeCSSAssetsPlugin({})
    // ] : []
  },
  resolve: {
    extensions: ['.js', '.json'],
    alias: {
      '@': SRC
    }
  },
  devServer: {
    historyApiFallback: true,
    noInfo: false
  },
  module: {
    rules: [
      {
        test: /\.(sa|sc|c)ss$/,
        use: [
          isDev() ? 'style-loader' : MiniCssExtractPlugin.loader,
          'css-loader',
          // 'postcss-loader',
          'sass-loader',
        ],
      },
      {
        test: /\.m?js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env']
          }
        }
      },
    ]
  },
  plugins
}
