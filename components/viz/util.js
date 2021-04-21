import clone from 'clone'

const DEBUG = false

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
	history: {},
	future: {
		authority: {
			source: '',
			production: {
				oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
				gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
			},
			reserves: {
				oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
				gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
			}
		},
		stable: {
			production: {
				oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
				gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
			},
			reserves: {
				oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
				gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
			}
		},
		decline: {
			production: {
				oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
				gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
			},
			reserves: {
				oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
				gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
			}
		}
	}
}

export const addCO2 = ( datapoint, fuel, deltaCO2 ) => {
	datapoint[ fuel ].scope1.co2 += deltaCO2.scope1.co2
	datapoint[ fuel ].scope3.co2 += deltaCO2.scope3.co2
	datapoint[ fuel ].scope1.range[ 0 ] += deltaCO2.scope1.range[ 0 ]
	datapoint[ fuel ].scope1.range[ 1 ] += deltaCO2.scope1.range[ 1 ]
	datapoint[ fuel ].scope3.range[ 0 ] += deltaCO2.scope3.range[ 0 ]
	datapoint[ fuel ].scope3.range[ 1 ] += deltaCO2.scope3.range[ 1 ]
	//console.log( fuel, datapoint[ fuel ], deltaCO2 )
}

const _accumulate = ( datapoint, production, estimate_prod ) => {
	const prodOil1 = makeEstimate( production.oil.scope1, estimate_prod )
	const prodOil3 = makeEstimate( production.oil.scope3, estimate_prod )
	const prodGas1 = makeEstimate( production.gas.scope1, estimate_prod )
	const prodGas3 = makeEstimate( production.gas.scope3, estimate_prod )
	datapoint.gas.scope1.co2 += prodGas1
	datapoint.gas.scope3.co2 += prodGas3
	datapoint.oil.scope1.co2 += prodOil1
	datapoint.oil.scope3.co2 += prodOil3
	datapoint.gas.scope1.range[ 0 ] += prodGas1
	datapoint.gas.scope1.range[ 1 ] += prodGas1
	datapoint.gas.scope3.range[ 0 ] += prodGas3
	datapoint.gas.scope3.range[ 1 ] += prodGas3
	datapoint.oil.scope1.range[ 0 ] += prodOil1
	datapoint.oil.scope1.range[ 1 ] += prodOil1
	datapoint.oil.scope3.range[ 0 ] += prodOil3
	datapoint.oil.scope3.range[ 1 ] += prodOil3
}

const _diff = ( datapoint, production ) => {
	const zero = value => Math.max( 0, value )

	return {
		oil: {
			scope1: {
				co2: zero( datapoint.oil.scope1.co2 - production.oil.scope1.co2 ),
				range: [
					zero( datapoint.oil.scope1.range[ 0 ] - production.oil.scope1.range[ 0 ] ),
					zero( datapoint.oil.scope1.range[ 1 ] - production.oil.scope1.range[ 1 ] ) ]
			},
			scope3: {
				co2: zero( datapoint.oil.scope3.co2 - production.oil.scope3.co2 ),
				range: [
					zero( datapoint.oil.scope3.range[ 0 ] - production.oil.scope3.range[ 0 ] ),
					zero( datapoint.oil.scope3.range[ 1 ] - production.oil.scope3.range[ 1 ] ) ]
			}
		},
		gas: {
			scope1: {
				co2: zero( datapoint.gas.scope1.co2 - production.gas.scope1.co2 ),
				range: [
					zero( datapoint.gas.scope1.range[ 0 ] - production.gas.scope1.range[ 0 ] ),
					zero( datapoint.gas.scope1.range[ 1 ] - production.gas.scope1.range[ 1 ] ) ]
			},
			scope3: {
				co2: zero( datapoint.gas.scope3.co2 - production.gas.scope3.co2 ),
				range: [
					zero( datapoint.gas.scope3.range[ 0 ] - production.gas.scope3.range[ 0 ] ),
					zero( datapoint.gas.scope3.range[ 1 ] - production.gas.scope3.range[ 1 ] ) ]
			}
		}
	}
}

export function makeEstimate( scope, estimate ) {
	if( estimate === 2 ) return scope.co2
	if( estimate < 2 ) return scope.co2 - ( ( scope.co2 - scope.range[ 0 ] ) * ( 2 - estimate ) / 2 )
	return scope.co2 + ( ( scope.range[ 1 ] - scope.co2 ) * ( estimate - 2 ) / 2 )
}

export function getFuelScopeCO2( datapoint, estimate ) {
	//console.log( { datapoint: JSON.stringify( datapoint ), estimate, e: makeEstimate( datapoint, estimate ) } )
	return makeEstimate( datapoint, estimate )
}

export function getFuelCO2( datapoint, estimate ) {
	//console.log( { datapoint } )
	return getFuelScopeCO2( datapoint.scope1, estimate ) + getFuelScopeCO2( datapoint.scope3, estimate )
}

export function getCO2( datapoint, estimate ) {
	if( !datapoint ) return 0
	//console.log( { datapoint } )
	return getFuelCO2( datapoint.oil, estimate ) + getFuelCO2( datapoint.gas, estimate )
}

export function filteredCombinedDataSet( production, reserves, fossilFuelTypes, sourceId, grades, futureSource, co2FromVolume ) {

	const dataset = []
	let point = clone( emptyPoint )

	if( production?.length < 1 ) return

	production
		.filter( data => {
			if( fossilFuelTypes && !fossilFuelTypes.includes( data.fossilFuelType ) ) return false
			//console.log( { data } )
			if( sourceId !== data.sourceId && !data.projection/*futureSource?.sourceId !== data.sourceId*/ ) return false
			return true
		} )
		.forEach( data => {
			//console.log( JSON.stringify( data ) )
			if( point.year && point.year !== data.year ) {
				dataset.push( point )
				point = clone( emptyPoint )
			}

			point.year = data.year
			if( data.year === 3030 ) console.log( { data } )
			const co2 = co2FromVolume( data, data.year === 3030 )

			if( data.projection ) {
				//console.log( point.future.authority.production, data.fossilFuelType, co2 )
				addCO2( point.future.authority.production, data.fossilFuelType, co2 )
			} else {
				addCO2( point.production, data.fossilFuelType, co2 )
			}
			return point
		} )

	dataset.push( point )

	// Now try to merge reserves into the dataset.

	let index = 0
	const filteredReserves = reserves
		.filter( data => {
			if( grades && !grades?.[ data.grade ] === true ) return false
			if( sourceId !== data.sourceId ) return false
			return true
		} )

	dataset
		.forEach( data => {
			if( data.year < filteredReserves[ index ]?.year ) return

			while( filteredReserves[ index ]?.year < data.year && index < filteredReserves.length ) index++

			while( filteredReserves[ index ]?.year === data.year && index < filteredReserves.length ) {
				const reserve = filteredReserves[ index ]
				const co2 = co2FromVolume( reserve, false, reserve.year === 3018 )
				addCO2( data.reserves, reserve.fossilFuelType, co2 )
				if( reserve.year === 3018 ) console.log( { reserve, acc: data.reserves, co2 } )
				index++
			}
		} )

	DEBUG && console.log( 'filteredCombinedDataSet',
		{
			fossilFuelTypes,
			source: sourceId,
			grades,
			in: production.length,
			combined: dataset.length,
			dataset
		}
	)

	//DEBUG && console.log( JSON.stringify( dataset.find( d => d.year === 2022 ), null, 2 ) )

	return dataset
}

export function dataSetEstimateFutures( dataset, _projection, estimate, estimate_prod ) {

	let projection = _projection
	if( _projection > 0 ) projection = 'authority'
	DEBUG && console.log( 'dataSetEstimateFutures', _projection, projection )

	let declinedValues
	let lastOilDataIndex, lastGasDataIndex
	let oilDepletedYear, gasDepletedYear

	let sumOfProjectedProduction = clone( emptyPoint.future )

	dataset?.forEach( ( dataYear, index ) => {
		if( dataYear.production.oil.scope3.co2 > 0 ) {
			lastOilDataIndex = index
		}
		if( dataYear.production.gas.scope3.co2 > 0 ) {
			lastGasDataIndex = index
		}
	} )

	if( !lastOilDataIndex ) {
		console.log( '>>>>>>> No last Oil Production' )
		return
	}

	// Extrapolate production so oil and gas end same year.

	if( lastGasDataIndex > lastOilDataIndex ) {
		for( let i = lastOilDataIndex + 1; i <= lastGasDataIndex; i++ ) {
			dataset[ i ].production.oil = clone( dataset[ lastOilDataIndex ].production.oil )
		}
	}
	if( lastGasDataIndex < lastOilDataIndex ) {
		for( let i = lastGasDataIndex + 1; i <= lastOilDataIndex; i++ ) {
			dataset[ i ].production.gas = clone( dataset[ lastGasDataIndex ].production.gas )
		}
	}

	let lastProductionIndex = Math.max( lastOilDataIndex, lastGasDataIndex )
	const lastProduction = dataset[ lastProductionIndex ]

	declinedValues = clone( emptyPoint )
	declinedValues.future.decline.production = clone( lastProduction.production )
	lastProduction.future.authority.reserves.oil = clone( lastProduction.reserves.oil )
	lastProduction.future.stable.reserves.oil = clone( lastProduction.reserves.oil )
	lastProduction.future.decline.reserves.oil = clone( lastProduction.reserves.oil )

	DEBUG && console.log( { lastProduction, lastOilDataIndex, lastGasDataIndex, declinedValues } )

	const zeroProd = { co2: 0, range: [ 0, 0 ] }

	for( let year = lastProduction.year; year <= 2040; year++ ) {
		//console.log( { year, lastDataIndex } )
		if( !dataset[ lastProductionIndex ] ) {
			dataset[ lastProductionIndex ] = clone( emptyPoint )
			dataset[ lastProductionIndex ].year = year
		}
		let currentYearData = dataset[ lastProductionIndex ]

		currentYearData.future.stable.production = clone( dataset[ lastOilDataIndex ].production )
		currentYearData.future.decline.production = clone( declinedValues.future.decline.production )

		declinedValues.future.decline.production.oil.scope1.co2 *= 0.9
		declinedValues.future.decline.production.oil.scope3.co2 *= 0.9
		declinedValues.future.decline.production.oil.scope1.range[ 0 ] *= 0.9
		declinedValues.future.decline.production.oil.scope1.range[ 1 ] *= 0.9
		declinedValues.future.decline.production.oil.scope3.range[ 0 ] *= 0.9
		declinedValues.future.decline.production.oil.scope3.range[ 1 ] *= 0.9
		declinedValues.future.decline.production.gas.scope1.co2 *= 0.9
		declinedValues.future.decline.production.gas.scope3.co2 *= 0.9
		declinedValues.future.decline.production.gas.scope1.range[ 0 ] *= 0.9
		declinedValues.future.decline.production.gas.scope1.range[ 1 ] *= 0.9
		declinedValues.future.decline.production.gas.scope3.range[ 0 ] *= 0.9
		declinedValues.future.decline.production.gas.scope3.range[ 1 ] *= 0.9

		// Calculate remaining reserves

		Object.keys( currentYearData.future ).forEach( projected => {

			_accumulate(
				sumOfProjectedProduction[ projected ].production,
				currentYearData.future[ projected ].production,
				estimate_prod )

			currentYearData.future[ projected ].reserves = _diff(
				lastProduction.reserves,
				sumOfProjectedProduction[ projected ].production )

			if( projected === projection ) {
				const remainingOil = getFuelCO2( currentYearData.future[ projected ].reserves.oil, estimate )
				if( remainingOil === 0 && oilDepletedYear === undefined ) {
					console.log( 'OIL DEPLETED', year, _projection )
					oilDepletedYear = year
				}

				const remainingGas = getFuelCO2( currentYearData.future[ projected ].reserves.gas, estimate )
				if( remainingGas === 0 && gasDepletedYear === undefined ) {
					console.log( 'GAS DEPLETED', year, _projection )
					gasDepletedYear = year
				}

				currentYearData.projection = clone( currentYearData.future[ projected ].production )

				if( year >= gasDepletedYear ) {
					currentYearData.projection.gas.scope1 = zeroProd
					currentYearData.projection.gas.scope3 = zeroProd
				}

				if( year >= oilDepletedYear ) {
					currentYearData.projection.oil.scope1 = zeroProd
					currentYearData.projection.oil.scope3 = zeroProd
				}
			}
		} )

		if( DEBUG && currentYearData.year === 2030 ) {
			console.log( {
				lastProduction,
				declinedValues: declinedValues,
				sumOfProjectedProduction
			} )
			//console.log( JSON.stringify( currentYearData, null, 2 ) )
		}

		lastProductionIndex++
	}


	DEBUG && console.log( 'dataSetEstimateFutures', { dataset, sumOfProjectedProduction } )
	//console.log( JSON.stringify( dataset.find( d => d.year === 2018 )?.production, null, 2 ) )

	return dataset
}
