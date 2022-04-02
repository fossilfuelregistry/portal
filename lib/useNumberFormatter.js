import React, { useEffect, useState } from "react"
import { useDispatch, useSelector, useStore } from "react-redux"


const useNumberFormatter = () => {
	const locale = useSelector( state => state.locale )

	const format = ( number ) => {
		return new Intl.NumberFormat( locale, { maximumSignificantDigits: 3 } ).format( number );

	}

	return format
}

export default useNumberFormatter