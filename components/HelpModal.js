import { QuestionCircleOutlined } from "@ant-design/icons"
import React from "react"
import { Modal } from "antd"
import ReactMarkdown from "react-markdown"
import getConfig from "next/config"
import useText from "../lib/useText"

const theme = getConfig()?.publicRuntimeConfig?.themeVariables

function helpModal( title, content ) {
	return Modal.info( {
		title,
		content: ( <ReactMarkdown>{ content }</ReactMarkdown> )
	} )
}

function HelpModal( { title, content } ) {
	const { getText } = useText()

	return (
		<div style={ { marginLeft: 10, display: 'inline-block' } }>
			<QuestionCircleOutlined
				style={ { color: theme[ '@primary-color' ] } }
				onClick={ () => helpModal( getText( title ), getText( content ) ) }
			/>
		</div>
	)
}

export default HelpModal