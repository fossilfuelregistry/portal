import { useEffect } from 'react'
import Graph from 'graph-data-structure'
import { useSelector } from "react-redux"
import { sumOfCO2 } from "../CO2Forecast/calculate"

const DEBUG = false

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
			console.log( { projection, reserves, projectionSourceId, reservesSourceId, limits, grades } )

			// Find most recent reserves and sum up 'p' and 'c' grades.

			const lastReserves = { oil: { p: 0, c: 0, year: 0 }, gas: { p: 0, c: 0, year: 0 } }
			for( let i = reserves.length - 1; i >= 0; i-- ) { // Scan in reverse to find latest.
				const r = reserves[ i ]
				if( r.sourceId !== reservesSourceId ) continue
				if( r.year < lastReserves[ r.fossilFuelType ].year ) continue
				const grade = r.grade[ 1 ] // Disregard first character.
				lastReserves[ r.fossilFuelType ].year = r.year
				lastReserves[ r.fossilFuelType ][ grade ] += sumOfCO2( co2FromVolume( r ), 1 )
			}
			console.log( { lastReserves } )

			let production = []

			// Fill out gap between production and projection (if any)
			for( let y = limits.production.lastYear; y < limits.projection.firstYear; y++ ) {
				production.push( {
					...stableProduction,
					year: y
				} )
			}

			console.log( { production } )

			projection.forEach( p => {
				if( p.sourceId != projectionSourceId ) return
				//if(p.year)
			} )
			return projection
		}

	return { co2FromVolume, convertOil, convertGas, reservesProduction }
}
