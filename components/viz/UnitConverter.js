import { useEffect } from 'react'
import Graph from 'graph-data-structure'
import { useSelector } from "react-redux"
import { getPreferredGrades, sumOfCO2 } from "../CO2Forecast/calculate"

const DEBUG = true

let graph
let graphOil
let graphGas
let conversion = []

export const useUnitConversionGraph = () => {
	const constants = useSelector( redux => redux.conversions )
	const gwp = useSelector( redux => redux.gwp )
	const stableProduction = useSelector( redux => redux.stableProduction )

	useEffect( () => {
		const _conversion = {}
		constants.forEach( c => {
			if( !_conversion[ c.fromUnit ] ) _conversion[ c.fromUnit ] = {}
			if( !_conversion[ c.fromUnit ][ c.toUnit ] ) _conversion[ c.fromUnit ][ c.toUnit ] = {
				oil: { factor: 1 },
				gas: {}
			}
			if( !c.fossilFuelType || c.fossilFuelType === 'oil' )
				_conversion[ c.fromUnit ][ c.toUnit ][ 'oil' ] = { factor: c.factor, low: c.low, high: c.high }
			if( !c.fossilFuelType || c.fossilFuelType === 'gas' )
				_conversion[ c.fromUnit ][ c.toUnit ][ 'gas' ] = { factor: c.factor, low: c.low, high: c.high }
		} )
		conversion = _conversion

		// Find unique units
		const _allUnits = {}
		constants.forEach( u => {
			_allUnits[ u.fromUnit ] = true
			_allUnits[ u.toUnit ] = true
		} )

		graph = Graph()
		graphOil = Graph()
		graphGas = Graph()

		Object.keys( _allUnits ).forEach( u => graph.addNode( u ) )

		constants.forEach( conv => {
			graph.addEdge( conv.fromUnit, conv.toUnit )
		} )
		constants.filter( c => c.fossilFuelType !== 'gas' ).forEach( conv => {
			graphOil.addEdge( conv.fromUnit, conv.toUnit )
		} )
		constants.filter( c => c.fossilFuelType !== 'oil' ).forEach( conv => {
			graphGas.addEdge( conv.fromUnit, conv.toUnit )
		} )
		// console.log( {
		// 	all: graph?.serialize(),
		// 	oil: graphOil?.serialize(),
		// 	gas: graphGas?.serialize(),
		// 	conversion
		// } )
	}, [ constants ] )

	const convertOil = ( value, fromUnit, toUnit ) => {
		try {
			const path = graphOil.shortestPath( fromUnit, toUnit )

			let factor = 1, low = 1, high = 1

			for( let step = 1; step < path.length; step++ ) {
				const from = path[ step - 1 ]
				const to = path[ step ]

				const conv = conversion[ from ][ to ].oil

				if( !conv ) throw new Error(
					`Conversion data issue: From ${ from } to ${ to } for Oil is ${ JSON.stringify( conv ) }` )

				factor *= conv.factor
				low *= conv.low
				high *= conv.high
			}

			return factor * value
		} catch( e ) {
			console.log( e.message + ': ' + fromUnit, toUnit )
			return value
		}
	}

	const convertGas = ( value, fromUnit, toUnit ) => {
		try {
			const path = graphGas.shortestPath( fromUnit, toUnit )

			let factor = 1, low = 1, high = 1

			for( let step = 1; step < path.length; step++ ) {
				const from = path[ step - 1 ]
				const to = path[ step ]

				const conv = conversion[ from ][ to ].gas

				if( !conv ) throw new Error(
					`Conversion data issue: From ${ from } to ${ to } for Gas is ${ JSON.stringify( conv ) }` )

				factor *= conv.factor
				low *= conv.low
				high *= conv.high
			}

			return factor * value
		} catch( e ) {
			console.log( e.message + ': ' + fromUnit, toUnit )
			//console.log( e.stack )
			return value
		}
	}

	const co2FromVolume = ( { volume, unit, fossilFuelType }, log ) => {
		if( !graphGas || !graphOil ) return { scope1: { co2: 0, range: [ 0, 0 ] }, scope3: { co2: 0, range: [ 0, 0 ] } }

		try {
			// Scope 1
			// For Scope 1 gas we need to find the general GWP instead of country specific one.

			const constant = constants.find( c => c.toUnit === gwp )
			let gasToUnit = gwp
			if( constant.country && constant.fossilFuelType === 'oil' ) {
				const nonCountryConstant = constants.filter(
					c => c.toUnit.startsWith( 'kgco2e' )
						&& ( c.fossilFuelType === 'gas' || !c.fossilFuelType )
						&& c.modifier === constant.modifier )
				if( !nonCountryConstant ) throw new Error( "Failed to find a Gas GWP conversion constant corresponding to " + gwp )
				gasToUnit = nonCountryConstant[ 0 ].toUnit
			}

			const path1 = ( fossilFuelType === 'oil' )
				? graphOil.shortestPath( unit, gwp )
				: graphGas.shortestPath( unit, gasToUnit )

			//console.log( 'Path to ', { unit, path, conversion } )
			let factor1 = 1, low1 = 1, high1 = 1
			for( let step = 1; step < path1.length; step++ ) {
				const from = path1[ step - 1 ]
				const to = path1[ step ]

				const conv = conversion[ from ][ to ][ fossilFuelType ]
				if( !conv ) throw new Error(
					`Conversion data issue: From ${ from } to ${ to } for ${ fossilFuelType } is ${ JSON.stringify( conv ) }` )
				const { factor: stepFactor, low: stepLow, high: stepHigh } = conv

				factor1 *= stepFactor
				low1 *= stepLow ?? stepFactor
				high1 *= stepHigh ?? stepFactor
				if( log && DEBUG ) console.log( 'SCOPE 1', {
					from,
					to,
					factor1,
					low1,
					high1,
					volume,
					value: 1e-9 * volume * factor1
				} )
			}

			// Scope 3

			const path = ( fossilFuelType === 'oil' )
				? graphOil.shortestPath( unit, 'kgco2e' )
				: graphGas.shortestPath( unit, 'kgco2e' )

			//console.log( 'Path to ', { unit, path, conversion } )
			let factor = 1, low = 1, high = 1
			for( let step = 1; step < path.length; step++ ) {
				const from = path[ step - 1 ]
				const to = path[ step ]

				const conv = conversion[ from ][ to ][ fossilFuelType ]
				if( !conv ) throw new Error(
					`Conversion data issue: From ${ from } to ${ to } for ${ fossilFuelType } is ${ JSON.stringify( conv ) }` )
				const { factor: stepFactor, low: stepLow, high: stepHigh } = conv

				factor *= stepFactor
				low *= stepLow ?? stepFactor
				high *= stepHigh ?? stepFactor
				if( log && DEBUG ) console.log( 'SCOPE 3', {
					from,
					to,
					factor,
					low,
					high,
					volume,
					value: 1e-9 * volume * factor
				} )
			}

			const result = {
				scope1: [ volume * low1 / 1e9, volume * factor1 / 1e9, volume * high1 / 1e9 ],
				scope3: [ volume * low / 1e9, volume * factor / 1e9, volume * high / 1e9 ]
			}

			if( log ) console.log( '.....co2', { result } )

			return result
		} catch( e ) {
			throw new Error( "While looking for " + unit + " -> kgco2e conversion:\n" + e.message )
		}
	}

	const reservesProduction =
		( projection, reserves, projectionSourceId, reservesSourceId, limits, grades ) => {
			if( !projectionSourceId || !reservesSourceId ) return []
			if( !projection?.length > 0 ) return []
			if( !reserves?.length > 0 ) return []
			if( !limits?.projection > 0 ) return []
			DEBUG && console.log( { projection, reserves, projectionSourceId, reservesSourceId, limits, grades } )

			// Find most recent preferred reserve

			const useGrades = getPreferredGrades( reserves, reservesSourceId )
			const lastReserves = {
				oil: { p: { year: 0, value: 0 }, c: { year: 0, value: 0 } },
				gas: { p: { year: 0, value: 0 }, c: { year: 0, value: 0 } }
			}
			for( let i = reserves.length - 1; i >= 0; i-- ) { // Scan in reverse to find latest.
				const r = reserves[ i ]
				if( r.sourceId !== reservesSourceId ) continue
				if( r.grade !== useGrades.pGrade && r.grade !== useGrades.cGrade ) continue
				const grade = r.grade[ 1 ] // Disregard first character.
				if( r.year < lastReserves[ r.fossilFuelType ][ grade ].year ) continue
				lastReserves[ r.fossilFuelType ][ grade ].year = r.year
				lastReserves[ r.fossilFuelType ][ grade ].value = sumOfCO2( co2FromVolume( r ), 1 )
			}
			DEBUG && console.log( { reservesSourceId, useGrades, lastReserves } )

			let prod = []

			// Fill out gap between production and projection (if any)
			const gapStart = Math.min( limits.production.oil.lastYear, limits.production.gas.lastYear )
			const gapEnd = Math.max( limits.projection.oil.firstYear, limits.projection.gas.firstYear, gapStart )
			for( let y = gapStart; y < gapEnd; y++ ) {
				if( limits.production.oil.lastYear <= y )
					prod.push( {
						...stableProduction.oil,
						year: y,
						fossilFuelType: 'oil',
						sourceId: projectionSourceId
					} )
				if( limits.production.gas.lastYear <= y )
					prod.push( {
						...stableProduction.gas,
						year: y,
						fossilFuelType: 'gas',
						sourceId: projectionSourceId
					} )
			}

			prod.forEach( p => p.co2 = co2FromVolume( p ) )

			projection.forEach( datapoint => {
				if( datapoint.sourceId !== projectionSourceId ) return
				if( datapoint.year < gapEnd ) return
				let _dp = { ...datapoint }
				_dp.co2 = co2FromVolume( datapoint )

				const pointProduction = sumOfCO2( _dp.co2, 1 )
				_dp.plannedProd = 0
				_dp.continProd = 0

				const fuelReserve = lastReserves[ datapoint.fossilFuelType ]

				// Subtract production from planned reserves first, then from contingent.

				if( fuelReserve.p.value > pointProduction ) {
					_dp.plannedProd = pointProduction
					fuelReserve.p.value -= _dp.plannedProd
				} else if( fuelReserve.p.value > 0 ) {
					_dp.continProd = pointProduction - fuelReserve.p.value
					_dp.plannedProd = fuelReserve.p.value
					fuelReserve.p.value = 0
					if( _dp.continProd > fuelReserve.c.value ) _dp.continProd = fuelReserve.c.value
					fuelReserve.c.value -= _dp.continProd
				} else if( fuelReserve.c.value > 0 ) {
					_dp.plannedProd = 0
					_dp.continProd = Math.min( fuelReserve.c.value, pointProduction )
					fuelReserve.c.value -= _dp.continProd
				}
				prod.push( _dp )
			} )

			console.log( { gapStart, gapEnd, prod, lastReserves } )

			return prod
		}

	return { co2FromVolume, convertOil, convertGas, reservesProduction }
}
