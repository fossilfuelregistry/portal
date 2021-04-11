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
			const conversion = q?.data?.conversionConstants?.nodes ?? []
			set_conversion( conversion )

			// Find unique units
			const _allUnits = {}
			conversion.forEach( u => {
				_allUnits[ u.fromUnit ] = true
				_allUnits[ u.toUnit ] = true
			} )

			graph.current = Graph()

			Object.keys( _allUnits ).forEach( u => graph.current.addNode( u ) )

			conversion.forEach( conv => {
				graph.current.addEdge( conv.fromUnit, conv.toUnit )
			} )
		}
		asyncEffect()
	}, [] )

	const co2FromReserve = ( datapoint, unit ) => {
		try {
			//console.log( 'Path to ', unit, graph.current.shortestPath( unit, 'kgco2e' ) )
			const oilCO2 = conversion.find( c => c.toUnit === 'kgco2e' && c.fossilFuelType === 'oil' )
			const gasCO2 = conversion.find( c => c.toUnit === 'kgco2e' && c.fossilFuelType === 'gas' )
			let gj = datapoint
			return { value: gj * oilCO2.factor, range: [ gj * oilCO2.low, gj * oilCO2.high ] }
		} catch( e ) {
			throw new Error( "While looking for " + unit + " -> kgco2e conversion:\n" + e.message )
		}
	}

	return { co2FromReserve }
}

export const useUnitConversionGraph = singletonHook( init, useUnitConversionGraphImpl )
