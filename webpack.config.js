var path = require('path');
var ROOT_PATH = path.resolve(__dirname);
var webpack = require('webpack');


module.exports = [
  {
    entry : path.resolve(ROOT_PATH, 'src/style.js'),
    output: {
      path    : path.resolve(ROOT_PATH, 'build'),
      filename: 'style.js'
    },
    module: {
      loaders   : [
        {
          test  : /\.css$/,
          loader: 'style-loader!css-loader!autoprefixer-loader'

        }
      ]
    }
  },
  {
    entry : path.resolve(ROOT_PATH, 'src/app.js'),
    output: {
      path    : path.resolve(ROOT_PATH, 'build'),
      filename: 'bundle.js'
    },
    module: {
      preLoaders: [
        {
          test   : /\.js?$/,
          loader : 'eslint-loader',
          include: path.resolve(ROOT_PATH, 'src')
        }
      ],
      loaders   : [
        {
          test  : /\.json$/,
          loader: "file?name=[name].[ext]"
        },
        {
          test  : /\.woff(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url?limit=10000&minetype=application/font-woff&name=assets/[name].[hash].[ext]'
        },
        {
          test  : /\.woff2(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url?limit=10000&minetype=application/font-woff2&name=assets/[name].[hash].[ext]'
        },
        {
          test  : /\.ttf(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url?limit=10000&minetype=application/octet-stream&name=assets/[name].[hash].[ext]'
        },
        {
          test  : /\.eot(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'file?name=assets/[name].[hash].[ext]'
        },
        {
          test  : /\.svg(\?v=\d+\.\d+\.\d+)?$/,
          loader: 'url?limit=10000&minetype=image/svg+xml&name=assets/[name].[hash].[ext]'
        },
        {
          test   : /\.js$/,
          exclude: /node_modules/,
          loaders: ['babel-loader'],
          include: path.resolve(ROOT_PATH, 'src')
        }
      ]
    }
  }
];