import React, { useCallback } from "react"
import { useSelector } from "react-redux"
import { Store } from "./types"

export default function useText() {
	const texts = useSelector( (redux: Store) => redux.texts )

	const getText = useCallback( (key: string) => {
		//console.info( 'useText', texts?.[ key ] )
		if( texts?.[ key ]?.length > 0 ) return texts[ key ]
		return '?? ' + key + ' ??'
	}, [ texts ] )

	return { getText }
}
