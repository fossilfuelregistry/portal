import React from 'react'
import { LoadingOutlined } from "@ant-design/icons"
import * as styleVariables from '!!../less-variable-loader!antd-custom.less'

export default function Loader( { withoutPosition } ) {
	return (
		<div
			style={{
				position: withoutPosition ? "relative" : "absolute",
				top: "50%",
				left: "50%",
				transform: "translate(-50%,-50%)"
			}}
		>
			<LoadingOutlined spin style={{ fontSize: 50, color: styleVariables[ 'primary-color' ] }}/>
		</div>
	)
}
