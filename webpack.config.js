var path = require( 'path' )
var HtmlWebpackPlugin = require( 'html-webpack-plugin' )

module.exports = {
	entry: [
		'./node_modules/angular2/bundles/angular2-polyfills.js',
		'./src/index.js'
	],
	output: {
		path: './dist',
		publicPath: '/',
		filename: 'bundle.js'
	},
	resolve: {
		alias: {
			src: path.resolve( __dirname, 'src' ),
			sass: path.resolve( __dirname, 'sass' )
		},
		extensions: [ '', '.js', '.sass' ]
	},
	module: {
		loaders: [
			{ test: /\.js$/, exclude: /node_modules/, loader: 'babel' },
			{ test: /\.sass$/, loaders: [ 'style', 'css', 'sass' ] },
			{ test: /\.html$/, loader: 'raw' }
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
