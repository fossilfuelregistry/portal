import React from 'react'
import { I18nProvider } from 'components/i18nContext'
import 'assets/app.less'
import 'assets/app.less'

function GFFR( { Component, pageProps } ) {
	return (
		<I18nProvider value={pageProps.texts}>
			<Component {...pageProps} />
		</I18nProvider>
	)
}

export default GFFR
