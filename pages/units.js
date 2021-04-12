import { useEffect, useRef } from "react"
import { DataSet, Network } from 'vis-network/standalone/umd/vis-network.min'
import TopNavigation from "components/navigation/TopNavigation"
import { GQL_conversions } from "../queries/general"
import { useQuery } from "@apollo/client"

const DEBUG = false

export default function Units() {
	const { data } = useQuery( GQL_conversions )
	const conversion = data?.conversionConstants?.nodes ?? []

	const domRef = useRef()

	useEffect( () => {
		// Find unique units
		const allUnits = {}
		conversion.forEach( u => {
			allUnits[ u.fromUnit ] = true
			allUnits[ u.toUnit ] = true
		} )

		const nodes = new DataSet( Object.keys( allUnits ).map( unitName => {
			return { id: unitName, label: unitName, font: '26px' }
		} ) )

		const colors = {
			oil: '#1999ff',
			gas: '#ffa031',
			null: '#a5a5a5'
		}
		// create an array with edges
		const edges = new DataSet( conversion.map( conv => {
			return {
				from: conv.fromUnit,
				to: conv.toUnit,
				arrows: 'to',
				font: { align: "middle", size: 18 },
				color: colors[ conv.fossilFuelType ?? 'null' ],
				width: 4
			}
		} ) )

		// create a network
		const data = {
			nodes: nodes,
			edges: edges,
		}
		const network = new Network( domRef.current, data, { physics: true } )
	}, [ domRef.current ] )

	return (
		<div className="page">
			<TopNavigation/>

			<div className="network" ref={domRef}/>

			<style jsx>{`
              .network {
                height: 80vh;
              }
			`}
			</style>

		</div>
	)
}

export { getStaticProps } from 'lib/getStaticProps'
