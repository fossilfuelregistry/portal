import React from 'react'
import { Alert } from "antd"
import ReactMarkdown from "react-markdown"

export default function DynamicZone( { content } ) {
	const rendered = []

	content?.forEach( block => {
		console.log( block )
		switch( block.__component ) {
			case "shared.text-block":
				rendered.push(<ReactMarkdown skipHtml>{ block.Text }</ReactMarkdown>)
				break
			default:
				rendered.push(
					<Alert
						showIcon key={ 4711 }
						type="warning"
						message={ <span>We do not know how to render a block of type &nbsp;<b>{ block.__component }</b>.</span> }
					/>
				)
				break
		}
	} )

	return ( <>{ rendered }</> )
}
