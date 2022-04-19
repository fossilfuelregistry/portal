import React, { useEffect, useState } from "react"
import { useSelector } from "react-redux"

const useISOLocale = () => {
	const [ isoLocale, setISOLocale ] = useState()
	const locale = useSelector( redux => redux.language )
    
	useEffect( () => {
		switch( locale ){
			case "fr":
				setISOLocale( 'fr-FR' )
				break
			case "es":
				setISOLocale( 'es-ES' )
				break
			case "en":
			default:
				setISOLocale( 'en-US' )
				break
		}
	}, [  locale ] );
	return isoLocale
}

export default useISOLocale