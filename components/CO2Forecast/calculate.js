export function addToTotal( total, datapoint ) {
	const scopes = Object.keys( datapoint )
	const ranges = Object.keys( datapoint[ scopes[ 0 ] ] )

	scopes.forEach( scope => {
		ranges?.forEach( range => {
			if( !total[ scope ] ) total[ scope ] = []
			if( !total[ scope ][ range ] ) total[ scope ] [ range ] = 0
			total[ scope ][ range ] += datapoint[ scope ][ range ]
		} )
	} )
}

function _sumOfFuelCO2( fuel, range ) {
	return fuel.scope1[ range ] + fuel.scope3[ range ]
}

export function sumOfCO2( datapoint, range ) {
	if( datapoint.oil ) {
		return _sumOfFuelCO2( datapoint.oil, range ) + _sumOfFuelCO2( datapoint.gas, range )
	} else {
		return _sumOfFuelCO2( datapoint, range )
	}
}
