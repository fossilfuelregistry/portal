const DEBUG = true

export function filteredCombinedDataSet( table, fossilFuelTypes, sources, grades, projection, co2FromVolume ) {

	const dataset = []
	let point = { gas: 0, oil: 0, gas_projection: 0, oil_projection: 0 }

	table
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

	DEBUG && console.log( 'filteredCombinedDataSet',
		{
			fossilFuelTypes, sources, grades, in: table.length, combined: dataset.length, dataset
		} )

	return dataset
}

/*
	const dataset = []
	let currentValue = {
		co2: 0,
		co2_span: [ 0, 0 ],
		co2_projection: 0,
		co2_projection_span: [ 0, 0 ],
		year: 0,
		empty: true
	}

	datasetValues.forEach( value => {
		if( value.year !== currentValue.year ) {
			if( !currentValue.empty ) {
				dataset.push( currentValue )
			}
			currentValue = value
			if( !currentValue.co2_span ) currentValue.co2_span = [ 0, 0 ]
			if( !currentValue.co2_projection_span ) currentValue.co2_projection_span = [ 0, 0 ]
		} else {
			currentValue.co2 += value.co2
			currentValue.co2_span[ 0 ] += value.co2_span?.[ 0 ]
			currentValue.co2_span[ 1 ] += value.co2_span?.[ 1 ]
			currentValue.co2_projection += value.co2_projection
			currentValue.co2_projection_span[ 0 ] += value.co2_projection_span?.[ 0 ]
			currentValue.co2_projection_span[ 1 ] += value.co2_projection_span?.[ 1 ]
		}
	} )

 */
