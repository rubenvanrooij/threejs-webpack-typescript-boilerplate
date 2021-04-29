//Webpack requires this to work with directories
const path =  require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

// This is main configuration object that tells Webpackw what to do. 
module.exports = {
    //path to entry paint
    entry: './src/main.ts',
    devtool: 'inline-source-map',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js',
    },
    devServer: {
        contentBase: [
          path.join(__dirname, 'dist'),
          path.join(__dirname, 'assets'),
        ],
      },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ],
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
            },
            {
                test: /\.js$/,
                exclude: /(node_modules)/,
                use: {
                    loader: 'babel-loader',
                    options: {
                        presets: ['@babel/preset-env']
                    }
                }
            }
        ],
    },
    plugins: [new HtmlWebpackPlugin({ title: 'ThreeJS boilerplate' })],
    //default mode is production
    mode: 'development'
};