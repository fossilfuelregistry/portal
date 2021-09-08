/* eslint-disable */
const withAntdLess = require( 'next-plugin-antd-less' )
const lessToJS = require( 'less-vars-to-js' )
const fs = require( 'fs' )
const path = require( 'path' )

// Where your antd-custom.less file lives
const themeVariables = lessToJS(
	fs.readFileSync( path.resolve( __dirname, './assets/antd-custom.less' ), 'utf8' )
)

module.exports = withAntdLess( {
	eslint: { ignoreDuringBuilds: true },
	modifyVars: themeVariables,
	publicRuntimeConfig: { themeVariables },
	webpack: ( config ) => {
		config.resolve.modules.push( path.resolve( './' ) )
		config.resolve.alias[ 'mapbox-gl' ] = 'maplibre-gl'
		return config
	},
	i18n: {
		locales: [ 'en', 'fr', 'es' ],
		defaultLocale: 'en'
	},
	async redirects() {
		return [
			{
				source: '/co2-forecast',
				destination: '/co2-forecast/-',
				permanent: false,
			}
		]
	}
} )
