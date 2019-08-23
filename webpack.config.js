const resolve = require('path').resolve;
const LIB_NAME = 'CordovaPluginIoTizeWifi';
// const webpack = require('webpack');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const CompressionPlugin = require('compression-webpack-plugin');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');
const webpackRxjsExternals = require('webpack-rxjs-externals');

module.exports = {
    entry: {
        'cordova-plugin-iotize-wifi': './dist/index.js',
        'cordova-plugin-iotize-wifi.min': './dist/index.js',
    },
    devtool: "source-map",
    output: {
        filename: `[name].js`,
        path: resolve(__dirname, 'dist', 'dist'),
        library: LIB_NAME,
		libraryTarget: "umd"
    },
    mode: 'production',
    optimization: {
      minimize: true,
    //   minimizer: [new UglifyJsPlugin({
    //     include: /\.min\.js$/
    //   })]
    },
    plugins: [
        // new webpack.optimize.DedupePlugin(), 
        new CompressionPlugin(),
        new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: './bundle-analyzer.html'
        })
    ], 
    externals: [
        webpackRxjsExternals()
    ]
};