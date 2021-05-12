const { extendDefaultPlugins } = require( 'svgo' )

module.exports = {
	"presets": [
		"next/babel"
	],
	"plugins": [
		[
			"import",
			{
				"libraryName": "antd",
				"style": true
			},
			"antd"
		],
		[
			"import",
			{
				"libraryName": "@ant-design/icons",
				"libraryDirectory": "",
				"camel2DashComponentName": false
			},
			"@ant-design/icons"
		],
		[
			"inline-react-svg",
			{
				"svgo": {
					"plugins": extendDefaultPlugins( [ { name: 'removeViewBox', active: false } ] )
				}
			}
		]
	]
}
