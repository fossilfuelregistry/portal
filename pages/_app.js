import React from 'react'
import { I18nProvider } from '../components/i18nContext'

function GFFR( { Component, pageProps } ) {
	console.log( { pageProps } )
	return (
		<I18nProvider value={pageProps.texts}>
			<Component {...pageProps} />
		</I18nProvider>
	)
}

export default GFFR
