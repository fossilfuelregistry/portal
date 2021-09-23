export function makeEstimate( scope, estimate ) {
	if( estimate === 2 ) return scope[ 1 ]
	if( estimate < 2 ) return scope[ 1 ] - ( ( scope[ 1 ] - scope[ 0 ] ) * ( 2 - estimate ) / 2 )
	return scope[ 1 ] + ( ( scope[ 2 ] - scope[ 1 ] ) * ( estimate - 2 ) / 2 )
}

export function getFuelScopeCO2( datapoint, estimate ) {
	//console.info( { datapoint: JSON.stringify( datapoint ), estimate, e: makeEstimate( datapoint, estimate ) } )
	return makeEstimate( datapoint, estimate )
}

export function getFuelCO2( datapoint, estimate ) {
	//console.info( { datapoint } )
	if( !datapoint ) return 0
	return getFuelScopeCO2( datapoint.scope1, estimate ) + getFuelScopeCO2( datapoint.scope3, estimate )
}

export function findLastProductionYear( data, sourceId ) {
	if( !data ) return {}
	let lastOilYear, lastGasYear

	data?.forEach( ( yearData ) => {
		if( yearData.projection ) return
		if( sourceId && yearData.sourceId !== sourceId ) return
		if( yearData.volume > 0 ) {
			if( yearData.fossilFuelType === 'gas' ) {
				lastGasYear = yearData.year
			}
			if( yearData.fossilFuelType === 'oil' ) {
				lastOilYear = yearData.year
			}
		}
	} )
	const yearData = data
		.filter( d => d.year === lastOilYear && d.fossilFuelType === 'oil' && d.sourceId === sourceId )
		.concat(
			data.filter( d => d.year === lastGasYear && d.fossilFuelType === 'gas' && d.sourceId === sourceId )
		)
	return { lastOilYear, lastGasYear, yearData }
}

export function findLastReservesYear( data ) {
	if( !data ) return {}
	let lastOilYear, lastGasYear

	data?.forEach( ( yearData ) => {
		if( yearData.volume > 0 ) {
			if( yearData.fossilFuelType === 'gas' ) {
				lastGasYear = yearData.year
			}
			if( yearData.fossilFuelType === 'oil' ) {
				lastOilYear = yearData.year
			}
		}
	} )

	const yearData = data.filter( d => d.year === lastOilYear && d.fossilFuelType === 'oil' ).concat(
		data.filter( d => d.year === lastGasYear && d.fossilFuelType === 'gas' )
	)

	return { lastOilYear, lastGasYear, yearData }
}
