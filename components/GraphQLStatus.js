import React from 'react'
import { Alert } from "antd"
import Loader from "./Loading"

export default function GraphQLStatus( { error, loading } ) {
	if( loading ) return ( <div style={ { padding: '2rem' } }><Loader/></div> )

	if( error && error instanceof Error ) {
		// Format to display nicely in Alert.
		let description = error.message
			.replace( /GraphQL error: /g, '' )
			.split( '\n' ).map( ( l, i ) => <p key={ i }>{ l }</p> )

		if( error.networkError ) {
			description = 'networkError status code: ' + error.networkError.statusCode
		}

		return (
			<div style={ { padding: '2rem' } }>
				<Alert
					type="error"
					showIcon message="GraphQL Error"
					description={ description }
				/>
			</div> )
	}
	return null
}
