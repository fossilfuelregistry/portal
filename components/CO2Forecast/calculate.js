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
	try {
		return fuel.scope1[ range ] + fuel.scope3[ range ]
	} catch( e ) {
		throw new Error( 'Cannot calculate CO2 of ' + JSON.stringify( fuel ) )
	}
}

export function sumOfCO2( datapoint, range ) {
	if( datapoint.oil ) {
		return _sumOfFuelCO2( datapoint.oil, range ) + _sumOfFuelCO2( datapoint.gas, range )
	} else {
		return _sumOfFuelCO2( datapoint, range )
	}
}

export function combineOilAndGas( dataset ) {
	let newDataset = []
	let nextCombinedPoint = { year: 0 }

	dataset.forEach( d => {
		if( nextCombinedPoint.year !== d.year ) {
			if( nextCombinedPoint.year !== 0 ) newDataset.push( nextCombinedPoint )
			nextCombinedPoint = { year: d.year }
		}
		nextCombinedPoint[ d.fossilFuelType ] = d
	} )
	newDataset.push( nextCombinedPoint )
	return newDataset
}
