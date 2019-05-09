const TerserPlugin = require('terser-webpack-plugin');
const CONSTANTS = require('./constants')('production');
// Common Plugins
const plugins = require('./webpack.plugins')(
	{
		environment: 'production',
		devtools: false
	}
);
// Common Loaders
const loaders = require('./webpack.loaders')(
	{
		environment: 'production',
		devtools: false
	}
);


module.exports = {
	mode: 'production',
	entry: './src/index',
	output: {
		path: CONSTANTS.outputPath,
		publicPath: '/',
		filename: CONSTANTS.jsBundleFileName
	},
	plugins: plugins,
	module: {
		rules: loaders
	},
	optimization: {
		minimize: true,
		noEmitOnErrors: true,
		minimizer: [
			new TerserPlugin({
				terserOptions: {
					parse: {
						ecma: 8
					},
					compress: {
						ecma: 5,
						inline: 2
					},
					output: {
						ecma: 5,
						comments: false,
						ascii_only: true
					}
				},
				parallel: true,
				cache: true,
				sourceMap: true
			})
		]
	}
};