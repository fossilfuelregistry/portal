const DEBUG = true

export function filteredCombinedDataSet( table, fossilFuelTypes, sources, grades, projection, co2FromVolume ) {

	let currentYear = 0
	const datasetValues = table
		.filter( r => {
			if( !fossilFuelTypes.includes( r.fossilFuelType ) ) return false
			if( !grades?.[ r.grade ] === true ) return false
			if( !sources.includes( r.sourceId ) ) return false
			if( projection !== null && projection !== r.projection ) return false
			return true
		} )
		.map( r => {
			const point = { year: r.year, fuel: r.fossilFuelType }
			currentYear = Math.min( currentYear, r.year )
			//if( r.year === 2019 ) console.log( r.year )
			const co2 = co2FromVolume( r.volume, r.unit, false /*r.year === 2019*/ )
			if( r.projection ) {
				point[ r.fossilFuelType + '_projection' ] = co2.value
				point[ r.fossilFuelType  + '_projection_span' ] = co2.range
			} else {
				point[ r.fossilFuelType  ] = co2.value
				point[ r.fossilFuelType  + '_span' ] = co2.range
			}
			return point
		} )

	const dataset = []
	let currentValue = {
		year: 0,
		empty: true
	}

	datasetValues.forEach( value => {
		if( value.year !== currentValue.year ) {
			if( !currentValue.empty ) {
				dataset.push( currentValue )
			}
			currentValue = value
		} else {
			currentValue = { ...currentValue, ...value }
		}
	} )

	DEBUG && console.log( 'filteredCombinedDataSet',
		{
			fossilFuelTypes, sources, grades, in: table.length,
			filtered: datasetValues.length, combined: dataset.length
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
