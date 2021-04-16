const DEBUG = true

export function filteredCombinedDataSet( production, reserves, fossilFuelTypes, sources, grades, projection, co2FromVolume ) {

	const dataset = []
	let point = { gas: 0, oil: 0, gas_projection: 0, oil_projection: 0 }

	if( production?.length < 2 ) return

	production
		.filter( r => {
			if( !fossilFuelTypes.includes( r.fossilFuelType ) ) return false
			if( !grades?.[ r.grade ] === true ) return false
			if( !sources.includes( r.sourceId ) ) return false
			if( projection !== null && projection !== r.projection ) return false
			return true
		} )
		.forEach( r => {
			if( point.year && point.year !== r.year ) {
				dataset.push( point )
				point = { year: r.year, gas1: 0, oil1: 0, oil3: 0, gas3: 0, gas_projection: 0, oil_projection: 0 }
			}
			point.year = r.year
			if( r.year === 2010 ) console.log( r.year )
			const co2 = co2FromVolume( r, r.year === 2010 )
			//console.log( { r, co2 } )
			if( r.projection ) {
				point[ r.fossilFuelType + '_projection' ] += co2.scope3 + co2.scope1
				point[ r.fossilFuelType + '_projection_span' ] += co2.range
			} else {
				point[ r.fossilFuelType + '1' ] += co2.scope1
				point[ r.fossilFuelType + '3' ] += co2.scope3
				point[ r.fossilFuelType + '_span' ] += co2.range
			}
			return point
		} )

	dataset.push( point )

	// Now try to merge reserves into the dataset.

	let index = 0
	dataset.forEach( data => {
		// console.log( index, reserves.length, data.year + '-' + reserves[ index ]?.year, data )
		if( data.year < reserves[ index ]?.year ) return

		while( reserves[ index ]?.year < data.year && index < reserves.length ) index++

		while( reserves[ index ]?.year === data.year && index < reserves.length ) {
			const reserve = reserves[ index ]
			data[ 'reserves_' + reserve.fossilFuelType ] = co2FromVolume( reserve, false )
			index++
		}
	} )

	// Projected production curves

	let lastProduction
	let decline
	let lastData
	dataset.forEach( data => {
		if( data.oil3 > 0 || data.gas3 > 0 ) {
			lastProduction = data
			decline = { ...data }
		} else if( lastProduction ) {
			lastData.stableOil = ( lastProduction.oil1 + lastProduction.oil3 )
			lastData.stableGas = ( lastProduction.gas1 + lastProduction.gas3 )
			lastData.declineOil = decline.oil1 + decline.oil3
			lastData.declineGas = decline.gas1 +decline.gas3
			decline.oil1 *= 0.8
			decline.oil3 *= 0.8
			decline.gas1 *= 0.8
			decline.gas3 *= 0.8
		}
		lastData = data
	} )

	DEBUG && console.log( 'filteredCombinedDataSet',
		{ fossilFuelTypes, sources, grades, in: production.length, combined: dataset.length, dataset }
	)

	return dataset
}
