import React from "react"
import {  useSelector } from "react-redux"


const useNumberFormatter = () => {
	const locale = useSelector( state => state.locale )

	const format = ( number, decimals = 0 ) => {
		return new Intl.NumberFormat( locale, { minimumFractionDigits: decimals } ).format( number );

	}

	return format
}

export default useNumberFormatter