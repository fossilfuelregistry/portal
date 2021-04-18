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
		auth: {
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

const _addCO2 = ( datapoint, fuel, deltaCO2 ) => {
	datapoint[ fuel ].scope1.co2 += deltaCO2.scope1
	datapoint[ fuel ].scope3.co2 += deltaCO2.scope3
	datapoint[ fuel ].scope1.range[ 0 ] += deltaCO2.s1range[ 0 ]
	datapoint[ fuel ].scope1.range[ 1 ] += deltaCO2.s1range[ 1 ]
	datapoint[ fuel ].scope3.range[ 0 ] += deltaCO2.s3range[ 0 ]
	datapoint[ fuel ].scope3.range[ 1 ] += deltaCO2.s3range[ 1 ]
	//console.log( fuel, datapoint[ fuel ], deltaCO2 )
}

const _accumulate = ( datapoint, production ) => {
	datapoint.gas.scope1.co2 += production.gas.scope1.co2
	datapoint.gas.scope3.co2 += production.gas.scope3.co2
	datapoint.oil.scope1.co2 += production.oil.scope1.co2
	datapoint.oil.scope3.co2 += production.oil.scope3.co2
	datapoint.gas.scope1.range[ 0 ] += production.gas.scope1.range[ 0 ]
	datapoint.gas.scope1.range[ 1 ] += production.gas.scope1.range[ 1 ]
	datapoint.gas.scope3.range[ 0 ] += production.gas.scope3.range[ 0 ]
	datapoint.gas.scope3.range[ 1 ] += production.gas.scope3.range[ 1 ]
	datapoint.oil.scope1.range[ 0 ] += production.oil.scope1.range[ 0 ]
	datapoint.oil.scope1.range[ 1 ] += production.oil.scope1.range[ 1 ]
	datapoint.oil.scope3.range[ 0 ] += production.oil.scope3.range[ 0 ]
	datapoint.oil.scope3.range[ 1 ] += production.oil.scope3.range[ 1 ]
}

const _diff = ( datapoint, production ) => {
	return {
		oil: {
			scope1: {
				co2: datapoint.oil.scope1.co2 - production.oil.scope1.co2,
				range: [
					datapoint.oil.scope1.range[ 0 ] - production.oil.scope1.range[ 0 ],
					datapoint.oil.scope1.range[ 1 ] - production.oil.scope1.range[ 1 ] ]
			},
			scope3: {
				co2: datapoint.oil.scope3.co2 - production.oil.scope3.co2,
				range: [
					datapoint.oil.scope3.range[ 0 ] - production.oil.scope3.range[ 0 ],
					datapoint.oil.scope3.range[ 1 ] - production.oil.scope3.range[ 1 ] ]
			}
		},
		gas: {
			scope1: {
				co2: datapoint.gas.scope1.co2 - production.gas.scope1.co2,
				range: [
					datapoint.gas.scope1.range[ 0 ] - production.gas.scope1.range[ 0 ],
					datapoint.gas.scope1.range[ 1 ] - production.gas.scope1.range[ 1 ] ]
			},
			scope3: {
				co2: datapoint.gas.scope3.co2 - production.gas.scope3.co2,
				range: [
					datapoint.gas.scope3.range[ 0 ] - production.gas.scope3.range[ 0 ],
					datapoint.gas.scope3.range[ 1 ] - production.gas.scope3.range[ 1 ] ]
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
	//console.log( { datapoint } )
	return getFuelCO2( datapoint.oil, estimate ) + getFuelCO2( datapoint.gas, estimate )
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
				const co2 = co2FromVolume( reserve, false, reserve.year === 2018 )
				_addCO2( data.reserves, reserve.fossilFuelType, co2 )
				if( reserve.year === 2018 ) console.log( { reserve, acc: data.reserves, co2 } )
				index++
			}
		} )

	DEBUG && console.log( 'filteredCombinedDataSet',
		{
			fossilFuelTypes,
			sources,
			grades,
			in: production.length,
			combined: dataset.length,
			dataset
		}
	)
	console.log( JSON.stringify( dataset.find( d => d.year === 2018 )?.production, null, 2 ) )

	return dataset
}

export function dataSetEstimateFutures( dataset ) {

	let lastProductionYear
	let declinedValues
	let lastData
	let sumOfProjectedProduction = clone( emptyPoint.future )

	dataset.forEach( dataYear => {
		if( dataYear.production.oil.scope3.co2 > 0 || dataYear.production.gas.scope3.co2 > 0 ) {
			lastProductionYear = dataYear
			declinedValues = clone( emptyPoint )
			declinedValues.future.decline.production = clone( dataYear.production )
			dataYear.future.auth.reserves = clone( dataYear.reserves )
			dataYear.future.stable.reserves = clone( dataYear.reserves )
			dataYear.future.decline.reserves = clone( dataYear.reserves )
		} else if( lastProductionYear ) {
			lastData.future.stable.production = clone( lastProductionYear.production )
			lastData.future.decline.production = clone( declinedValues.future.decline.production )
			declinedValues.future.decline.production.oil.scope1.co2 *= 0.8
			declinedValues.future.decline.production.oil.scope3.co2 *= 0.8
			declinedValues.future.decline.production.oil.scope1.range[ 0 ] *= 0.8
			declinedValues.future.decline.production.oil.scope1.range[ 1 ] *= 0.8
			declinedValues.future.decline.production.oil.scope3.range[ 0 ] *= 0.8
			declinedValues.future.decline.production.oil.scope3.range[ 1 ] *= 0.8
			declinedValues.future.decline.production.gas.scope1.co2 *= 0.8
			declinedValues.future.decline.production.gas.scope3.co2 *= 0.8
			declinedValues.future.decline.production.gas.scope1.range[ 0 ] *= 0.8
			declinedValues.future.decline.production.gas.scope1.range[ 1 ] *= 0.8
			declinedValues.future.decline.production.gas.scope3.range[ 0 ] *= 0.8
			declinedValues.future.decline.production.gas.scope3.range[ 1 ] *= 0.8

			_accumulate( sumOfProjectedProduction.auth.production, lastData.projection )
			_accumulate( sumOfProjectedProduction.stable.production, lastData.future.stable.production )
			_accumulate( sumOfProjectedProduction.decline.production, lastData.future.decline.production )

			dataYear.future.auth.reserves = _diff( lastProductionYear.reserves, sumOfProjectedProduction.auth.production )
			dataYear.future.stable.reserves = _diff( lastProductionYear.reserves, sumOfProjectedProduction.stable.production )
			dataYear.future.decline.reserves = _diff( lastProductionYear.reserves, sumOfProjectedProduction.decline.production )

			if( dataYear.year === 2018 ) {
				console.log( {
					lastData,
					lastProduction: lastProductionYear,
					decline: declinedValues,
					sumOfProjectedProduction
				} )
			}
		}
		lastData = dataYear
	} )

	DEBUG && console.log( 'dataSetEstimateFutures', { dataset, sumOfProjectedProduction } )
	//console.log( JSON.stringify( dataset.find( d => d.year === 2018 )?.production, null, 2 ) )

	return dataset
}
