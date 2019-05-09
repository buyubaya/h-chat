const CONSTANTS = require('./constants')('development');


module.exports = {
	contentBase: CONSTANTS.outputPath,
	inline: true,
	hot: true,
	port: 8008,
	open: true,
	historyApiFallback: true,
	after: function (app, server) {
		app.get('/error', function (req, res) {
			res.json({
				error: 'ERROR'
			});
		});

		app.get('*', function (req, res) {
			res.sendFile(CONSTANTS.outputPath + '/index.html');
		});
	}
};