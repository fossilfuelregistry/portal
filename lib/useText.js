import { useCallback } from 'react'
import { textsSelector, useStore } from "./zustandProvider"

export default function useText() {
	const texts = useStore( textsSelector )

	const getText = useCallback( key => {
		if( texts?.[ key ]?.length > 0 ) return texts[ key ]
		return '?? ' + key + ' ??'
	}, [ texts ] )

	return { getText }
}
