import { useCallback } from 'react'
import { useSelector } from "react-redux"

export default function useText() {
	const texts = useSelector( redux => redux.texts )

	const getText = useCallback( key => {
		//console.log( 'useText', texts?.[ key ] )
		if( texts?.[ key ]?.length > 0 ) return texts[ key ]
		return '?? ' + key + ' ??'
	}, [ texts ] )

	return { getText }
}
