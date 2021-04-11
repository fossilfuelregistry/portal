import React from 'react'
import { LoadingOutlined } from "@ant-design/icons"
import getConfig from "next/config"

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

export default function Loading( { withoutPosition } ) {
	return (
		<div
			style={{
				position: withoutPosition ? "relative" : "absolute",
				top: "50%",
				left: "50%",
				transform: "translate(-50%,-50%)"
			}}
		>
			<LoadingOutlined spin style={{ fontSize: 50, color: theme[ '@primary-color' ] }}/>
		</div>
	)
}
