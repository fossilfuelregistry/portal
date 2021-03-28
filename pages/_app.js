import React, { useEffect } from 'react'
import { StoreProvider } from 'lib/zustandProvider'
import { useHydrate } from 'lib/store'
import 'assets/app.less'
import { getUserIP } from "lib/getUserIp"
import { ApolloClient, InMemoryCache, ApolloProvider } from '@apollo/client'

const client = new ApolloClient( {
	uri: process.env.NEXT_PUBLIC_BACKEND_URL + '/graphql',
	cache: new InMemoryCache()
} )

function GFFR( { Component, pageProps } ) {

	const store = useHydrate( pageProps.initialZustandState )

	useEffect( () => {
		getUserIP()
			.then( ip => {
				store.setState( { ip } )
				return fetch( process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/ip-location/' + ip )
			} )
			.then( api => {
				return api.json()
			} )
			.then( ipLocation => {
				store.setState( { ipLocation: { lat: ipLocation.lat, lng: ipLocation.lon } } )
			} )
			.catch( e => console.log( e.message ) )
	}, [] )

	return (
		<ApolloProvider client={client}>
			<StoreProvider store={store}>
				<Component {...pageProps} />
			</StoreProvider>
		</ApolloProvider>
	)
}

export default GFFR
