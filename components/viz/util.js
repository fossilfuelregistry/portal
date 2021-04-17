import clone from 'clone'

const DEBUG = true

const emptyPoint = {
	production: {
		oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
		gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
	},
	projection: {
		oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
		gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
	},
	reserves: {
		oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
		gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
	},
	future: {
		stable: {
			oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
			gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
		},
		decline: {
			oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
			gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
		}
	}
}

const _addCO2 = ( datapoint, fuel, deltaCO2 ) => {
	//console.log( fuel, datapoint[ fuel ] )
	datapoint[ fuel ].scope1.co2 += deltaCO2.scope1
	datapoint[ fuel ].scope3.co2 += deltaCO2.scope3
	datapoint[ fuel ].scope1.range[ 0 ] += deltaCO2.s1range[ 0 ]
	datapoint[ fuel ].scope1.range[ 1 ] += deltaCO2.s1range[ 1 ]
	datapoint[ fuel ].scope3.range[ 0 ] += deltaCO2.s3range[ 0 ]
	datapoint[ fuel ].scope3.range[ 1 ] += deltaCO2.s3range[ 1 ]
}

export function getFuelScopeCO2( datapoint ) {
	//console.log( { datapoint } )
	return datapoint.co2
}

export function getFuelCO2( datapoint ) {
	//console.log( { datapoint } )
	return getFuelScopeCO2( datapoint.scope1 ) + getFuelScopeCO2( datapoint.scope3 )
}

export function getCO2( datapoint ) {
	//console.log( { datapoint } )
	return getFuelCO2( datapoint.oil ) + getFuelCO2( datapoint.gas )
}

export function filteredCombinedDataSet( production, reserves, fossilFuelTypes, sources, grades, projection, co2FromVolume ) {

	const dataset = []
	let point = clone( emptyPoint )

	if( production?.length < 2 ) return

	production
		.filter( data => {
			if( !fossilFuelTypes.includes( data.fossilFuelType ) ) return false
			if( !grades?.[ data.grade ] === true ) return false
			if( !sources.includes( data.sourceId ) ) return false
			if( projection !== null && projection !== data.projection ) return false
			return true
		} )
		.forEach( data => {
			if( point.year && point.year !== data.year ) {
				dataset.push( point )
				point = clone( emptyPoint )
			}

			point.year = data.year
			if( data.year === 3018 ) console.log( data.projection, data.year )
			const co2 = co2FromVolume( data, data.year === 3018 )
			//console.log( { r, co2 } )
			if( data.projection ) {
				_addCO2( point.projection, data.fossilFuelType, co2 )
			} else {
				_addCO2( point.production, data.fossilFuelType, co2 )
			}
			return point
		} )

	dataset.push( point )

	// Now try to merge reserves into the dataset.

	let index = 0
	const filteredReserves = reserves
		.filter( data => {
			if( data.year < 2010 ) return false
			if( !grades?.[ data.grade ] === true ) return false
			if( !sources.includes( data.sourceId ) ) return false
			return true
		} )

	dataset
		.filter( data => data.year >= 2010 )
		.forEach( data => {
			if( data.year < filteredReserves[ index ]?.year ) return

			while( filteredReserves[ index ]?.year < data.year && index < filteredReserves.length ) index++

			while( filteredReserves[ index ]?.year === data.year && index < filteredReserves.length ) {
				const reserve = filteredReserves[ index ]
				//if( reserve.year === 2018 ) console.log( reserve.year, reserve.grade, reserve.fossilFuelType, reserve.sourceId )
				const co2 = co2FromVolume( reserve, false, reserve.year === 3018 )
				_addCO2( data.reserves, reserve.fossilFuelType, co2 )
				index++
			}
		} )

	// Projected production curves

	let lastProduction
	let decline
	let lastData
	let sumOfProjectedProduction = { stable: { oil: 0, gas: 0 }, decline: { oil: 0, gas: 0 } }

	dataset.forEach( data => {
		if( data.production.oil.scope3.co2 > 0 || data.production.gas.scope3.co2 > 0 ) {
			lastProduction = data
			decline = clone( emptyPoint )
			decline.future.decline = clone( data.production )
		} else if( lastProduction ) {
			lastData.future.stable = clone( lastProduction.production )
			lastData.future.decline = clone( decline.future.decline )
			decline.future.decline.oil.scope1.co2 *= 0.8
			decline.future.decline.oil.scope3.co2 *= 0.8
			decline.future.decline.oil.scope3.range[ 0 ] *= 0.8
			decline.future.decline.oil.scope3.range[ 1 ] *= 0.8
			decline.future.decline.gas.scope1.co2 *= 0.8
			decline.future.decline.gas.scope3.co2 *= 0.8
			decline.future.decline.gas.scope3.range[ 0 ] *= 0.8
			decline.future.decline.gas.scope3.range[ 1 ] *= 0.8
			if( data.year === 2022 ) console.log( { data, lastData, lastProduction, decline } )
		}
		lastData = data
	} )

	DEBUG && console.log( 'filteredCombinedDataSet',
		{ fossilFuelTypes, sources, grades, in: production.length, combined: dataset.length, dataset }
	)

	return dataset
}
