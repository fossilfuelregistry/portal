import { useCallback } from 'react'

export default function useTracker() {

	const trackEvent = useCallback( ( event, value ) => {
		if( typeof window === 'undefined' ) return
		window.umami.trackEvent( event, value )
	}, [] )

	const trackView = useCallback( page => {
		if( typeof window === 'undefined' ) return
		window.umami.trackView( page )
	}, [] )

	return { trackEvent, trackView }
}
