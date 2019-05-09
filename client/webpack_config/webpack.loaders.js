const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const autoprefixer = require('autoprefixer');


module.exports = function(options){
	const CONSTANTS = require('./constants')(options.environment);

	return [
		{
			test: /\.js$/,
			include: [CONSTANTS.srcPath],
			use: ['babel-loader']
		},
		// Hosted Javascript (emit each file so it can be packaged and uploaded)
		{
			test: /\.js$/,
			include: [CONSTANTS.jsPath],
			use: [
				{
					loader: 'url-loader',
					options: {
						name: CONSTANTS.jsFileName
					}
				}
			]
		},
		// CSS
		{
			test: /\.css$/, 
			use: (options.environment === 'production')
			?
			['css-loader']
			:
			['style-loader', 'css-loader']
		},
		// Sass
		{
			test: /\.scss$/,
			use: (options.environment === 'production')
			?
			[
				{
					loader: MiniCssExtractPlugin.loader
				},
				'css-loader',
				{
					loader: 'postcss-loader',
					options: {
						plugins: () => [
							autoprefixer({
								browsers: [
									'>1%',
									'last 4 versions',
									'Firefox ESR',
									'not ie < 9',
								],
								flexbox: 'no-2009'
							})
						]
					}
				},
				'sass-loader'
			]
			:
			[
				'style-loader',
				'css-loader',
				'sass-loader'
			]
		},
		// Fonts
		{
			test: /.(woff(2)?|eot|ttf)(\?[a-z0-9=\.]+)?$/,
			use: [
				{
					loader: 'url-loader',
					options: {
						limit: 1,
						name: CONSTANTS.fontFileName
					}
				}
			]
		},
		// Images
		{
			test: /\.(jpe?g|png|gif|svg|ico)/,
			use: [
				{
					loader: 'url-loader',
					options: {
						limit: 1,
						name: CONSTANTS.imageFileName
					}
				}
			]
		},
		// PDFs
		{
			test: /\.(pdf)/,
			use: [
				{
					loader: 'url-loader',
					options: {
						limit: 1,
						name: CONSTANTS.pdfFileName
					}
				}
			]
		}
	]
};