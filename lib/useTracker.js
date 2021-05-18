import { useCallback } from 'react'

export default function useTracker() {

	let lastView

	const trackEvent = useCallback( ( event, value ) => {
		if( typeof window === 'undefined' ) return
		window.umami.trackEvent( event, value )
	}, [] )

	const trackView = useCallback( page => {
		if( typeof window === 'undefined' ) return
		if( lastView && Date.now() - lastView < 1000 ) {
			console.log( 'Track event cancelled:', Date.now() - lastView )
			return
		}
		lastView = Date.now()
		window.umami.trackView( page )
	}, [] )

	return { trackEvent, trackView }
}
