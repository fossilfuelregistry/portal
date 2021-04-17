import { useEffect, useRef, useState } from 'react'
import { singletonHook } from 'react-singleton-hook'
import Graph from 'graph-data-structure'
import { client } from "pages/_app"
import { GQL_conversions } from "queries/general"

const init = { loading: true }

const useUnitConversionGraphImpl = () => {
	const [ conversion, set_conversion ] = useState( [] )
	const graph = useRef()
	const graphOil = useRef()
	const graphGas = useRef()

	useEffect( () => {

		const asyncEffect = async() => {
			const q = await client.query( { query: GQL_conversions } )
			const constants = q?.data?.conversionConstants?.nodes ?? []
			const conversion = {}
			constants.forEach( c => {
				if( !conversion[ c.fromUnit ] ) conversion[ c.fromUnit ] = {}
				if( !conversion[ c.fromUnit ][ c.toUnit ] ) conversion[ c.fromUnit ][ c.toUnit ] = {
					oil: { factor: 1 },
					gas: {}
				}
				if( !c.fossilFuelType || c.fossilFuelType === 'oil' )
					conversion[ c.fromUnit ][ c.toUnit ][ 'oil' ] = { factor: c.factor, low: c.low, high: c.high }
				if( !c.fossilFuelType || c.fossilFuelType === 'gas' )
					conversion[ c.fromUnit ][ c.toUnit ][ 'gas' ] = { factor: c.factor, low: c.low, high: c.high }
			} )
			set_conversion( conversion )
			//console.log( { conversion } )
			// Find unique units
			const _allUnits = {}
			constants.forEach( u => {
				_allUnits[ u.fromUnit ] = true
				_allUnits[ u.toUnit ] = true
			} )

			graph.current = Graph()
			graphOil.current = Graph()
			graphGas.current = Graph()

			Object.keys( _allUnits ).forEach( u => graph.current.addNode( u ) )

			constants.forEach( conv => {
				graph.current.addEdge( conv.fromUnit, conv.toUnit )
			} )
			constants.filter( c => c.fossilFuelType !== 'gas' ).forEach( conv => {
				graphOil.current.addEdge( conv.fromUnit, conv.toUnit )
			} )
			constants.filter( c => c.fossilFuelType !== 'oil' ).forEach( conv => {
				graphGas.current.addEdge( conv.fromUnit, conv.toUnit )
			} )
			// console.log( {
			// 	all: graph.current?.serialize(),
			// 	oil: graphOil.current?.serialize(),
			// 	gas: graphGas.current?.serialize(),
			// 	conversion
			// } )
		}
		asyncEffect()
	}, [] )

	const co2FromVolume = ( { volume, unit, fossilFuelType }, log ) => {
		try {

			// Scope 1

			const path1 = ( fossilFuelType === 'oil' )
				? graphOil.current.shortestPath( unit, 'kgco2e_1' )
				: graphGas.current.shortestPath( unit, 'kgco2e_1' )

			//console.log( 'Path to ', { unit, path, conversion } )
			let factor1 = 1, low1 = 1, high1 = 1
			for( let step = 1; step < path1.length; step++ ) {
				const from = path1[ step - 1 ]
				const to = path1[ step ]
				const { factor: stepFactor, low: stepLow, high: stepHigh } =
					conversion[ from ][ to ][ fossilFuelType ]

				factor1 *= stepFactor
				low1 *= stepLow ?? stepFactor
				high1 *= stepHigh ?? stepFactor
				if( log ) console.log( 'SCOPE 1', { from, to, factor1, low1, high1, volume, value: 1e-9 * volume * factor1 } )
			}

			// Scope 3

			const path = ( fossilFuelType === 'oil' )
				? graphOil.current.shortestPath( unit, 'kgco2e' )
				: graphGas.current.shortestPath( unit, 'kgco2e' )

			//console.log( 'Path to ', { unit, path, conversion } )
			let factor = 1, low = 1, high = 1
			for( let step = 1; step < path.length; step++ ) {
				const from = path[ step - 1 ]
				const to = path[ step ]
				const { factor: stepFactor, low: stepLow, high: stepHigh } =
					conversion[ from ][ to ][ fossilFuelType ]

				factor *= stepFactor
				low *= stepLow ?? stepFactor
				high *= stepHigh ?? stepFactor
				if( log ) console.log( 'SCOPE 3', { from, to, factor, low, high, volume, value: 1e-9 * volume * factor } )
			}


			return {
				scope1: volume * factor1 / 1e9,
				scope3: volume * factor / 1e9,
				s1range: [ volume * low1 / 1e9, volume * high1 / 1e9 ],
				s3range: [ volume * low / 1e9, volume * high / 1e9 ]
			}
		} catch( e ) {
			throw new Error( "While looking for " + unit + " -> kgco2e conversion:\n" + e.message )
		}
	}

	return { co2FromVolume }
}

export const useUnitConversionGraph = singletonHook( init, useUnitConversionGraphImpl )
