import React, { useEffect } from 'react'
import { wrapper } from 'lib/store'
import { getUserIP } from "lib/getUserIp"
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { ConfigProvider } from "antd"
import { useDispatch } from "react-redux"
import { useRouter } from "next/router"
import useTracker from "../lib/useTracker"

require( 'assets/app.less' )

export const client = new ApolloClient( {
	uri: process.env.NEXT_PUBLIC_BACKEND_URL + '/graphql',
	cache: new InMemoryCache()
} )

function GFFR( { Component, pageProps } ) {
	const dispatch = useDispatch()
	const router = useRouter()
	const { trackView } = useTracker()

	useEffect( () => {
		const handleRouteChange = ( url ) => {
			trackView( url )
		}
		router.events.on( 'routeChangeComplete', handleRouteChange )
		return () => {
			router.events.off( 'routeChangeComplete', handleRouteChange )
		}
	}, [ router.events ] )

	useEffect( () => {
		getUserIP()
			.then( ip => {
				dispatch( { type: 'IP', payload: ip } )
				return fetch( process.env.NEXT_PUBLIC_BACKEND_URL + '/api/v1/ip-location/' + ip )
			} )
			.then( api => {
				return api.json()
			} )
			.then( ipLocation => {
				dispatch( { type: 'IPLOCATION', payload: { lat: ipLocation.lat, lng: ipLocation.lon } } )
			} )
			.catch( e => console.log( e.message ) )
	}, [] )

	return (
		<ApolloProvider client={ client }>
			<ConfigProvider componentSize={ 'large' }>
				<Component { ...pageProps } />
			</ConfigProvider>
		</ApolloProvider>
	)
}

export default wrapper.withRedux( GFFR )
