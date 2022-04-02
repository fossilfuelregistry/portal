import React, { useCallback } from "react"

const DEBUG = false

export default function useTracker() {

	let lastView = Date.now()

	const trackEvent = useCallback( ( event, values ) => {
		if( typeof window === 'undefined' ) return
		if( typeof window.gtag === 'undefined' ) return

		window.gtag( 'event', event, values )
	}, [] )

	const trackView = useCallback( page => {
		if( typeof window === 'undefined' ) return
		if( typeof window.gtag === 'undefined' ) return

		// Throttle somewhat to avoid tracking programmatic parameter updates
		if( lastView && Date.now() - lastView < 500 ) {
			DEBUG && console.info( 'Track event cancelled:', Date.now() - lastView )
			return
		}

		DEBUG && console.info( 'Track event ' + page + ' time:', Date.now() - lastView )
		lastView = Date.now()

		window.gtag( 'event', 'page_view', { page_location: page } )
	}, [] )

	return { trackEvent, trackView }
}
