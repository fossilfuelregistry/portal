import clone from 'clone'
import { max } from 'd3-array'
import _get from 'lodash/get'
import _set from 'lodash/set'
import { useUnitConversionGraph } from './UnitConverter'

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
	history: {},
	future: {
		reserves: {},
		production: {},
		authority: {
			source: '',
			production: {
				oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
				gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
			}
		},
		stable: {
			production: {
				oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
				gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
			}
		},
		decline: {
			production: {
				oil: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } },
				gas: { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }
			}
		}
	}
}

export function addCO2( datapoint, fuel, deltaCO2 ) {
	datapoint[ fuel ].scope1.co2 += deltaCO2.scope1.co2
	datapoint[ fuel ].scope3.co2 += deltaCO2.scope3.co2
	datapoint[ fuel ].scope1.range[ 0 ] += deltaCO2.scope1.range[ 0 ]
	datapoint[ fuel ].scope1.range[ 1 ] += deltaCO2.scope1.range[ 1 ]
	datapoint[ fuel ].scope3.range[ 0 ] += deltaCO2.scope3.range[ 0 ]
	datapoint[ fuel ].scope3.range[ 1 ] += deltaCO2.scope3.range[ 1 ]
	//console.log( fuel, datapoint[ fuel ], deltaCO2 )
}

const valuePaths = [
	'oil.scope1.co2', 'oil.scope1.range[0]', 'oil.scope1.range[1]',
	'oil.scope3.co2', 'oil.scope3.range[0]', 'oil.scope3.range[1]',
	'gas.scope1.co2', 'gas.scope1.range[0]', 'gas.scope1.range[1]',
	'gas.scope3.co2', 'gas.scope3.range[0]', 'gas.scope3.range[1]',
]

const _subtractProductionFromReserves = ( reserve, production ) => {
	const result = { p: {}, c: {}, production: { p: {}, c: {} } }
	for( let path of valuePaths ) {
		let pReserve = _get( reserve.p, path )
		let cReserve = _get( reserve.c, path )
		let prod = _get( production, path )
		//console.log( pReserve, cReserve, prod )

		pReserve -= prod

		if( pReserve < 0 ) {
			// Grade p reserves depleted
			const remain = -pReserve
			pReserve = 0
			cReserve -= remain
			if( cReserve < 0 ) {
				// Grade c reserves also depleted
				_set( result.production.p, path, 0 )
				_set( result.production.c, path, remain + cReserve ) // final bits...
				cReserve = 0
				//console.log( 'p', 0, 'c', remain + cReserve )
			} else {
				// We are producing from c
				_set( result.production.p, path, prod - remain )
				_set( result.production.c, path, remain )
				//console.log( 'p', prod - remain, 'c', remain )
			}
		} else {
			// We are producing from p
			_set( result.production.p, path, prod )
			_set( result.production.c, path, 0 )
			//console.log( 'p', prod, 'c', 0 )
		}

		_set( result.p, path, pReserve )
		_set( result.c, path, cReserve )
	}
	return result
}

const _multiply = ( datapoint, factor ) => {
	for( let path of valuePaths ) {
		_set( datapoint, path, _get( datapoint, path ) * factor )
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
	if( !datapoint ) return 0
	return getFuelScopeCO2( datapoint.scope1, estimate ) + getFuelScopeCO2( datapoint.scope3, estimate )
}

export function getCO2( datapoint, estimate = 2 ) {
	if( !datapoint ) return 0
	//console.log( { datapoint } )
	return getFuelCO2( datapoint.oil, estimate ) + getFuelCO2( datapoint.gas, estimate )
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

export function _log1_future( y, p ) {
	console.log( y,
		p.production?.p.oil.scope1.co2,
		p.production?.p.oil.scope3.co2,
		p.production?.p.gas.scope1.co2,
		p.production?.p.gas.scope3.co2,
		p.production?.c.oil.scope1.co2,
		p.production?.c.oil.scope3.co2,
		p.production?.c.gas.scope1.co2,
		p.production?.c.gas.scope3.co2,
	)
}

export default function useCalculations() {
	const { co2FromVolume } = useUnitConversionGraph()

	function filteredCombinedDataSet( production, reserves, fossilFuelTypes, sourceId, grades, futureSource, _projection ) {
		if( !sourceId ) return []

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

		// Find latest reserves estimate from highest quality source.

		const _reserveSources = reserves.reduce( ( sources, datapoint ) => {
			if( sources[ datapoint.sourceId ] )
				sources[ datapoint.sourceId ].quality = datapoint.quality
			else
				sources[ datapoint.sourceId ] = { quality: datapoint.quality, sourceId: datapoint.sourceId }
			return sources
		}, {} )

		const reserveSources = Object.keys( _reserveSources )
			.map( k => _reserveSources[ k ] )
			.sort( ( a, b ) => Math.sign( a.quality - b.quality ) )

		const qualitySources = reserves.reduce( ( qualities, datapoint ) => {
			if( qualities[ datapoint.quality ] )
				qualities[ datapoint.quality ][ datapoint.sourceId ] = true
			else
				qualities[ datapoint.quality ] = { [ datapoint.sourceId ]: true }
			return qualities
		}, {} )

		const qualities = Object.keys( qualitySources ).map( q => parseInt( q ) )

		const bestSourceQuality = max( qualities )
		const bestSources = Object.keys( qualitySources[ bestSourceQuality ] ?? {} ).map( q => parseInt( q ) )
		const bestSourceId = bestSources[ 0 ] // Pick first source if there are several.

		// Build an array of years of best source
		const years = Object.keys( reserves
			.filter( datapoint => bestSources.includes( datapoint.sourceId ) )
			.reduce( ( years, datapoint ) => {
				years[ datapoint.year ] = true
				return years
			}, {} ) ).map( y => parseInt( y ) )

		const lastYearOfBestReserve = max( years )
		const bestReserves = reserves.filter( datapoint => datapoint.year === lastYearOfBestReserve && datapoint.sourceId === bestSources[ 0 ] )

		const initialReserves = {
			p: clone( emptyPoint.reserves ),
			c: clone( emptyPoint.reserves )
		}

		const gradesToUse = '3x12'

		let pGrade = -1, cGrade = -1
		bestReserves.forEach( r => {
			if( r.grade?.[ 1 ] === 'p' ) {
				pGrade = Math.max( pGrade, gradesToUse.indexOf( r.grade?.[ 0 ] ) )
			}
			if( r.grade?.[ 1 ] === 'c' ) {
				cGrade = Math.max( cGrade, gradesToUse.indexOf( r.grade?.[ 0 ] ) )
			}
		} )
		if( pGrade < 0 ) pGrade = 'na'
		else pGrade = gradesToUse[ pGrade ] + 'p'
		if( cGrade < 0 ) cGrade = 'na'
		else cGrade = gradesToUse[ cGrade ] + 'c'

		bestReserves.forEach( r => {
			if( r.grade === pGrade )
				addCO2( initialReserves.p, r.fossilFuelType, co2FromVolume( r ) )
			else if( r.grade === cGrade )
				addCO2( initialReserves.c, r.fossilFuelType, co2FromVolume( r ) )
		} )

		DEBUG && console.log( {
			reserveSources,
			qualitySources,
			qualities,
			bestSourceQuality,
			bestSources,
			years,
			lastYearOfBestReserve,
			bestReserves,
			initialReserves
		} )
		//DEBUG && console.log( 'filteredCombinedDataSet', { fossilFuelTypes, source: sourceId, grades, in: production.length, combined: dataset.length, dataset } )
		//DEBUG && console.log( JSON.stringify( dataset.find( d => d.year === 2022 ), null, 2 ) )

		let projection = _projection
		if( _projection > 0 ) projection = 'authority'

		let declinedValues

		const { lastOilYear, lastGasYear, yearData } = findLastProductionYear( production, sourceId )
		const lastOilDataIndex = dataset.findIndex( d => d.year === lastOilYear )
		const lastGasDataIndex = dataset.findIndex( d => d.year === lastGasYear )

		if( !lastOilDataIndex ) {
			console.log( '>>>>>>> No last Oil Production' )
			return
		}

		DEBUG && console.log( 'Estimate Futures for', _projection, projection, lastOilYear, lastGasYear, lastOilDataIndex, lastGasDataIndex, yearData )

		if( lastGasDataIndex < 0 || lastOilDataIndex < 0 ) throw new Error( `Failed to find year for last production in dataset: ${ lastOilYear } ${ lastGasYear } >> ${ lastOilDataIndex } ${ lastGasDataIndex } ` )

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

		// Initialize projected production and reserves

		declinedValues = clone( emptyPoint )
		declinedValues.future.decline.production = clone( lastProduction?.production )

		lastProduction.future.reserves = clone( initialReserves )
		DEBUG && console.log( { initialReserves } )
		let remainingReserves = clone( initialReserves )

		DEBUG && console.log( { lastProduction, lastOilDataIndex, lastGasDataIndex, declinedValues } )

		for( let year = lastProduction.year; year <= 2040; year++ ) {
			//console.log( { year, lastDataIndex } )
			if( !dataset[ lastProductionIndex ] ) {
				dataset[ lastProductionIndex ] = clone( emptyPoint )
				dataset[ lastProductionIndex ].year = year
			}
			let currentYearData = dataset[ lastProductionIndex ]

			currentYearData.future.stable.production = clone( dataset[ lastOilDataIndex ].production )
			currentYearData.future.decline.production = clone( declinedValues.future.decline.production )

			_multiply( declinedValues.future.decline.production, 0.9 )

			// Calculate remaining reserves

			remainingReserves = _subtractProductionFromReserves(
				remainingReserves,
				currentYearData.future[ projection ].production
			)

			currentYearData.future.reserves = clone( remainingReserves )

			currentYearData.projection = clone( currentYearData.future[ projection ].production )

			if( DEBUG && currentYearData.year === 3030 ) {
				console.log( {
					lastProduction,
					declinedValues: declinedValues
				} )
				console.log( JSON.stringify( currentYearData.future.reserves.production.p, null, 2 ) )
				console.log(
					year,
					currentYearData.future.reserves.p.oil.scope1.co2,
					currentYearData.future.reserves.p.gas.scope1.co2,
					currentYearData.future.reserves.c.oil.scope1.co2,
					currentYearData.future.reserves.c.gas.scope1.co2
				)
			}

			lastProductionIndex++
		}

		DEBUG && console.log( 'dataSetEstimateFutures', { dataset } )
		//console.log( JSON.stringify( dataset.find( d => d.year === 2030 )?.production, null, 2 ) )

		return { co2: dataset, bestReservesSourceId: bestSourceId, lastYearOfBestReserve, pGrade, cGrade }
	}

	return { filteredCombinedDataSet }
}
