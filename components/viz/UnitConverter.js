import { useEffect, useRef, useState } from 'react'
import { singletonHook } from 'react-singleton-hook'
import Graph from 'graph-data-structure'
import { client } from "pages/_app"
import { GQL_conversions } from "queries/general"

const init = { loading: true }

const useUnitConversionGraphImpl = () => {
	const [ conversion, set_conversion ] = useState( [] )
	const graph = useRef()

	useEffect( () => {

		const asyncEffect = async() => {
			const q = await client.query( { query: GQL_conversions } )
			const constants = q?.data?.conversionConstants?.nodes ?? []
			const conversion = {}
			constants.forEach( c => {
				if( !conversion[ c.fromUnit ] ) conversion[ c.fromUnit ] = {}
				conversion[ c.fromUnit ][ c.toUnit ] = { factor: c.factor, low: c.low, high: c.high }
			} )
			set_conversion( conversion )

			// Find unique units
			const _allUnits = {}
			constants.forEach( u => {
				_allUnits[ u.fromUnit ] = true
				_allUnits[ u.toUnit ] = true
			} )

			graph.current = Graph()

			Object.keys( _allUnits ).forEach( u => graph.current.addNode( u ) )

			constants.forEach( conv => {
				graph.current.addEdge( conv.fromUnit, conv.toUnit )
			} )
		}
		asyncEffect()
	}, [] )

	const co2FromVolume = ( datapoint, unit, log ) => {
		try {
			const path = graph.current.shortestPath( unit, 'kgco2e' )
			//console.log( 'Path to ', { unit, path, conversion } )
			let factor = 1, low = 1, high = 1
			for( let step = 1; step < path.length; step++ ) {
				const from = path[ step - 1 ]
				const to = path[ step ]
				factor *= conversion[ from ][ to ].factor
				low *= conversion[ from ][ to ].low ?? conversion[ from ][ to ].factor
				high *= conversion[ from ][ to ].high ?? conversion[ from ][ to ].factor
				if( log ) console.log( { from, to, factor, low, high } )
			}
			return {
				value: Math.round( 10 * datapoint * factor / 1e9 ) / 10,
				range: [ datapoint * low / 1e9, datapoint * high / 1e9 ]
			}
		} catch( e ) {
			throw new Error( "While looking for " + unit + " -> kgco2e conversion:\n" + e.message )
		}
	}

	return { co2FromVolume }
}

export const useUnitConversionGraph = singletonHook( init, useUnitConversionGraphImpl )
