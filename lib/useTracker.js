import { useCallback } from 'react'

const DEBUG = true

export default function useTracker() {

	let lastView = Date.now()

	const trackEvent = useCallback( ( event, value ) => {
		if( typeof window === 'undefined' ) return
		window?.umami?.trackEvent( event, value )
	}, [] )

	const trackView = useCallback( page => {
		if( typeof window === 'undefined' ) return

		// Throttle somewhat to avoid tracking programmatic parameter updates
		if( lastView && Date.now() - lastView < 500 ) {
			DEBUG && console.log( 'Track event cancelled:', Date.now() - lastView )
			return
		}

		DEBUG && console.log( 'Track event ' + page + ' time:', Date.now() - lastView )
		lastView = Date.now()

		window.gtag( 'event', 'page_view', { page_location: page } )
	}, [] )

	return { trackEvent, trackView }
}
