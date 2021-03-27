import React, { useEffect } from 'react'
import { StoreProvider } from 'lib/zustandProvider'
import { useHydrate } from 'lib/store'
import 'assets/app.less'
import { getUserIP } from "lib/getUserIp"

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
				store.setState( { ipLocation } )
			} )
			.catch( e => console.log( e.message ) )
	}, [] )

	return (
		<StoreProvider store={store}>
			<Component {...pageProps} />
		</StoreProvider>
	)
}

export default GFFR
