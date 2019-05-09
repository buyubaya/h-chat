const devServer = require('./webpack.devServer.js');
const CONSTANTS = require('./constants')('development');
// Common plugins
const plugins = require('./webpack.plugins')(
	{
		environment: 'development',
		devtools: true
	}
);
// Common loaders
const loaders = require('./webpack.loaders')(
	{
		environment: 'development',
		devtools: true
	}
);


module.exports = {
	mode: 'development',
	devtool: 'cheap-module-eval-source-map',
	entry: CONSTANTS.entryPath,
	output: {
		path: CONSTANTS.outputPath,
		publicPath: '/',
		filename: CONSTANTS.jsBundleFileName
	},
	devServer,
	plugins,
	module: {
		rules: loaders
	}
};