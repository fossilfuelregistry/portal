import React from 'react'
import { Alert } from "antd"
import Query from "./Query"
import TextWithQuery from "./TextWithQuery"

export default function DynamicZone( { content } ) {
	const rendered = []

	content?.forEach( block => {

		switch( block.__component ) {
			case "shared.text-block":
				rendered.push( <TextWithQuery key={ 'T' + block.id } template={ block.Text }/> )
				break
			case "shared.query":
				rendered.push( <Query block={ block } key={ 'Q' + block.id }/> )
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
