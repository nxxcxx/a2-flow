var path = require( 'path' )
var HtmlWebpackPlugin = require( 'html-webpack-plugin' )

module.exports = {
	entry: [
		'./src/index.js'
	],
	output: {
		path: './dist',
		publicPath: '/',
		filename: 'bundle.js'
	},
	resolve: {
		alias: {
			root: path.resolve( __dirname ),
			src: path.resolve( __dirname, 'src' ),
			sass: path.resolve( __dirname, 'sass' )
		},
		extensions: [ '', '.js', '.sass', '.css' ]
	},
	module: {
		loaders: [
			{ test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
			{ test: /\.sass$|\.css$/, loaders: [ 'style', 'css', 'sass' ] },
			{ test: /\.html$/, loader: 'raw' },
			{ test: /\.(png|jpg|woff|woff2|eot|ttf|svg)(\?.*$|$)/, exclude: /node_modules/, loader: 'url-loader?importLoaders=1&limit=100000' }
		]
	},
	plugins: [
		new HtmlWebpackPlugin( {
			template: './src/index.html',
			inject: 'body'
		} )
	],
	devtool: '#inline-source-map'
}
