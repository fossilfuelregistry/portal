import React from "react"

let oilCO2, gasCO2

function _init( conversion ) {
	if( !( conversion?.length > 0 ) ) return false
	if( oilCO2?.factor && gasCO2?.factor ) return true

	if( !oilCO2 )
		oilCO2 = conversion.find( c => c.toUnit === 'kgco2e' && c.fossilFuelType === 'oil' )
	if( !gasCO2 )
		gasCO2 = conversion.find( c => c.toUnit === 'kgco2e' && c.fossilFuelType === 'gas' )
	//console.log( { conversion, oilCO2, gasCO2 } )
	return true
}

export function co2FromReserve( datapoint, unit, conversion ) {
	if( !_init( conversion ) ) throw new Error( 'Conversion factors are not initialized.' )
	//console.log( { conversion, oilCO2, gasCO2 } )

	let gj = datapoint

	return { value: gj * oilCO2.factor, range: [ gj * oilCO2.low, gj * oilCO2.high ] }
}


class UnitConverter extends React.Component {
	state = {}

	constructor() {
		super();
	}

	render() {
		return null
	}
}

export let unitConverter = new UnitConverter();
