import React, { useEffect, useState } from 'react'
import ReactMarkdown from "react-markdown"
import useTextInjectQueryResult from "./useTextInjectQueryResult"

export default function TextWithQuery( { template } ) {
	const injectQueryResult = useTextInjectQueryResult()
	const [ result, set_result ] = useState( template )

	console.log( { result, template } )

	useEffect( () => {
			const asyncEffect = async() => {
				set_result( await injectQueryResult( template ) )
			}
			asyncEffect()
		},
		[ template ] )

	return (
		<ReactMarkdown skipHtml>{ result }</ReactMarkdown>
	)
}
