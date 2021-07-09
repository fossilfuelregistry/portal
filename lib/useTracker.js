import { useCallback } from 'react'

const DEBUG = false

export default function useTracker() {

	let lastView = Date.now()

	const trackEvent = useCallback( ( event, value ) => {
		if( typeof window === 'undefined' ) return
		window?.umami?.trackEvent( event, value )
	}, [] )

	const trackView = useCallback( page => {
		if( typeof window === 'undefined' ) return
		DEBUG && console.log( 'Track event time:', Date.now() - lastView )
		if( lastView && Date.now() - lastView < 1000 ) {
			DEBUG && console.log( 'Track event cancelled:', Date.now() - lastView )
			return
		}
		lastView = Date.now()
		window?.umami?.trackView( page )
	}, [] )

	return { trackEvent, trackView }
}
